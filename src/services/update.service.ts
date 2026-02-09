import { Project } from '../models/project.model';
import { ServiceResult } from '../models/common.model';
import { readFileContent, writeToFile } from '../modules/file.module';
import { updatePackage, updatePackageVersion, setVersionOverride } from '../modules/xml.module';
import { checkAccess, checkAccessForPath, getPackage, getProject } from './common.service';
import { ExtensionConfiguration } from '../models/option.model';
import { isUpdate } from './version.service';

export function update(
    projectList: Project[],
    projectID: number,
    packageName: string,
    selectedVersion: string,
    config: ExtensionConfiguration
): ServiceResult {
    const project = getProject(projectList, projectID);
    const pkg = getPackage(project, packageName);

    let commandResult = checkAccess(project);
    if (commandResult.isSuccessful) {
        if (project.isCpm && project.propsFilePath && pkg.isCentrallyManaged) {
            // === CPM Mode: version is in Directory.Packages.props ===
            commandResult = checkAccessForPath(project.propsFilePath);
            if (!commandResult.isSuccessful) {
                return commandResult;
            }

            // Update the central PackageVersion in props file
            const propsContent = readFileContent(project.propsFilePath);
            const updatedProps = updatePackageVersion(propsContent, packageName, selectedVersion);
            writeToFile(project.propsFilePath, updatedProps);

            // Update in-memory version for this package in ALL projects sharing the same props file
            projectList.forEach(p => {
                if (p.isCpm && p.propsFilePath === project.propsFilePath) {
                    const matchPkg = p.packages.find(
                        pk => pk.packageName === packageName && pk.isCentrallyManaged
                    );
                    if (matchPkg) {
                        matchPkg.packageVersion = selectedVersion;
                        matchPkg.isUpdated = isUpdate(selectedVersion, matchPkg.newerVersion);
                    }
                }
            });

            commandResult = {
                message: `${pkg.packageName} updated in Directory.Packages.props (CPM)`,
                isSuccessful: true,
            };
        } else if (project.isCpm && pkg.hasVersionOverride) {
            // === CPM Mode with VersionOverride: update attribute on project file ===
            const projectFileContent = readFileContent(project.projectPath);
            const xmlContent = setVersionOverride(projectFileContent, packageName, selectedVersion);
            writeToFile(project.projectPath, xmlContent);

            pkg.packageVersion = selectedVersion;
            pkg.isUpdated = isUpdate(selectedVersion, pkg.newerVersion);

            commandResult = {
                message: `${pkg.packageName} VersionOverride updated in ${project.projectName}`,
                isSuccessful: true,
            };
        } else {
            // === Non-CPM Mode (existing behavior) ===
            pkg.isUpdated = isUpdate(selectedVersion, pkg.newerVersion);

            updatePackageInProjectFile(
                project.projectPath,
                pkg.packageName,
                selectedVersion,
                config
            );

            pkg.packageVersion = selectedVersion;

            commandResult = {
                message: `${pkg.packageName} updated in ${project.projectName}`,
                isSuccessful: true,
            };
        }
    }

    return commandResult;
}

export function updateAllPackage(
    projectList: Project[],
    packageName: string,
    selectedVersion: string,
    config: ExtensionConfiguration
): ServiceResult[] {
    let commandResultList: ServiceResult[] = [];

    // For CPM: track which props files we've already updated to avoid redundant writes
    const updatedPropsFiles: Set<string> = new Set();

    projectList.forEach(project => {
        let pkgIndex = project.packages.findIndex(
            e => e.packageName === packageName
        );
        if (pkgIndex !== -1) {
            const pkg = project.packages[pkgIndex];

            // For centrally managed packages, skip if we already updated this props file
            if (project.isCpm && pkg.isCentrallyManaged && project.propsFilePath) {
                if (updatedPropsFiles.has(project.propsFilePath)) {
                    // Already updated — just refresh in-memory state
                    pkg.packageVersion = selectedVersion;
                    pkg.isUpdated = isUpdate(selectedVersion, pkg.newerVersion);
                    commandResultList.push({
                        isSuccessful: true,
                        message: `${project.projectName}|${packageName}`,
                    });
                    return;
                }
                updatedPropsFiles.add(project.propsFilePath);
            }

            let commandResult = update(
                projectList,
                project.id,
                packageName,
                selectedVersion,
                config
            );
            if (commandResult.isSuccessful) {
                commandResultList.push({
                    isSuccessful: true,
                    message: `${project.projectName}|${packageName}`,
                });
            } else {
                commandResultList.push(commandResult);
            }
        }
    });
    return commandResultList;
}

export function updateAllProjects(
    projectList: Project[],
    config: ExtensionConfiguration
): ServiceResult[] {
    let commandResultList: ServiceResult[] = [];
    const updatedPropsFiles: Set<string> = new Set();

    projectList.forEach(project => {
        const packages = project.packages.filter(x => x.isUpdated == false);
        packages.forEach(pkg => {
            // For centrally managed packages, skip if we already updated this props file for this package
            const propsKey = `${project.propsFilePath}|${pkg.packageName}`;
            if (project.isCpm && pkg.isCentrallyManaged && project.propsFilePath) {
                if (updatedPropsFiles.has(propsKey)) {
                    pkg.packageVersion = pkg.newerVersion;
                    pkg.isUpdated = isUpdate(pkg.newerVersion, pkg.newerVersion);
                    commandResultList.push({
                        isSuccessful: true,
                        message: `${project.projectName}|${pkg.packageName}`,
                    });
                    return;
                }
                updatedPropsFiles.add(propsKey);
            }

            let commandResult = update(
                projectList,
                project.id,
                pkg.packageName,
                pkg.newerVersion,
                config
            );
            if (commandResult.isSuccessful) {
                commandResultList.push({
                    isSuccessful: true,
                    message: `${project.projectName}|${pkg.packageName}`,
                });
            } else {
                commandResultList.push(commandResult);
            }
        });
    });

    return commandResultList;
}

function updatePackageInProjectFile(
    projectPath: string,
    packageName: string,
    selectedVersion: string,
    config: ExtensionConfiguration
) {
    const projectFileContent = readFileContent(projectPath);
    const xmlContent: string = updatePackage(
        projectFileContent,
        packageName,
        selectedVersion
    );
    writeToFile(projectPath, xmlContent);
}

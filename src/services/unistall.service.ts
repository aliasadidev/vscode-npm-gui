import { Project } from '../models/project.model';
import { ServiceResult } from '../models/common.model';
import { readFileContent, writeToFile } from '../modules/file.module';
import { removePackage, removePackageVersion } from '../modules/xml.module';
import {
    checkAccess, checkAccessForPath, getPackageIndex, getProject,
    isPackageInOtherCpmProjects,
} from './common.service';
import { ExtensionConfiguration } from '../models/option.model';

export function remove(
    projectList: Project[],
    projectID: number,
    packageName: string,
    config: ExtensionConfiguration
): ServiceResult {
    const project = getProject(projectList, projectID);
    const pkgIndex = getPackageIndex(project, packageName);

    let commandResult = checkAccess(project);
    if (commandResult.isSuccessful) {
        // Remove PackageReference from the project file (works for both CPM and non-CPM)
        const projectFileContent = readFileContent(project.projectPath);
        const xmlContent: string = removePackage(
            projectFileContent,
            packageName,
            project
        );
        writeToFile(project.projectPath, xmlContent);

        // Remove from in-memory list
        project.packages.splice(pkgIndex, 1);

        // CPM: also clean up PackageVersion from props if orphaned
        if (project.isCpm && project.propsFilePath) {
            const isUsedElsewhere = isPackageInOtherCpmProjects(
                projectList,
                project.id,
                packageName,
                project.propsFilePath
            );
            if (!isUsedElsewhere) {
                const propsAccessResult = checkAccessForPath(project.propsFilePath);
                if (propsAccessResult.isSuccessful) {
                    try {
                        const propsContent = readFileContent(project.propsFilePath);
                        const updatedProps = removePackageVersion(propsContent, packageName);
                        writeToFile(project.propsFilePath, updatedProps);
                    } catch {
                        // If removal from props fails, the project-level removal still succeeded
                    }
                }
            }
        }

        commandResult = {
            message: `${packageName} removed from ${project.projectName}`,
            isSuccessful: true,
        };
    }

    return commandResult;
}

export function removeAllPackage(
    projectList: Project[],
    packageName: string,
    config: ExtensionConfiguration
) {
    let commandResultList: ServiceResult[] = [];

    projectList.forEach(project => {
        const packages = project.packages.filter(x => x.packageName == packageName);
        packages.forEach(pkg => {
            let commandResult = remove(
                projectList,
                project.id,
                pkg.packageName,
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

    // After removing from all projects, ensure PackageVersion is cleaned from all affected props files
    const propsFilesToClean = new Set<string>();
    projectList.forEach(p => {
        if (p.isCpm && p.propsFilePath) {
            propsFilesToClean.add(p.propsFilePath);
        }
    });

    propsFilesToClean.forEach(propsPath => {
        // Check if any project still references this package
        const stillUsed = projectList.some(
            p =>
                p.isCpm &&
                p.propsFilePath === propsPath &&
                p.packages.some(pk => pk.packageName === packageName)
        );
        if (!stillUsed) {
            try {
                const propsContent = readFileContent(propsPath);
                const updatedProps = removePackageVersion(propsContent, packageName);
                writeToFile(propsPath, updatedProps);
            } catch {
                // PackageVersion may already have been removed
            }
        }
    });

    return commandResultList;
}

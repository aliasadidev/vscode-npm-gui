import * as vscode from 'vscode';
import glob = require('glob');
import { Project } from '../models/project.model';
import * as path from 'path';
import { PackageVersion, PackageDetail } from '../models/nuget.model';
import { fetchPackageVersionsBatch } from '../modules/nuget.module';
import { getPackages, isCpmEnabled, getPackageVersionsFromProps } from '../modules/xml.module';
import { mergeList } from '../modules/utils';
import {
    findStableVersion,
    isUpdate,
    mergeVersionPatterns,
} from './version.service';
import { readFileContent, findPropsFile } from '../modules/file.module';
import { ExtensionConfiguration } from '../models/option.model';
import { FindProjectResult } from '../models/common.model';

/**
 * Finding all projects within the workspace folder
 * @param workspaceFolder The workspace folder
 * @returns The list of csproj/fsproj path
 */
export function findProjects(
    workspaceFolder: readonly vscode.WorkspaceFolder[]
): string[] {
    let result: string[] = [];

    workspaceFolder.forEach(folder => {
        let files = glob.sync(`${folder.uri.fsPath}/**/*.+(csproj|fsproj)`, {
            ignore: ['**/node_modules/**', '**/.git/**'],
        });

        files.forEach(file => {
            if (result.indexOf(file) === -1) {
                result.push(file);
            }
        });
    });

    return result;
}

async function setPackageVersions(
    config: ExtensionConfiguration,
    projects: Project[]
) {
    let hasPackage = projects.some(r => r.packages && r.packages.length > 0);
    if (hasPackage) {
        const allUniquePackages: string[] = mergeList(
            projects.map(q => q.packages.map(e => e.packageName))
        );

        let packageVersions: PackageVersion[] = await fetchPackageVersionsBatch(
            allUniquePackages,
            config.packageSources,
            config.requestTimeout,
            config.vscodeHttpConfig
        );

        let keyValuePackageVersions: Record<string, string[]> = {};
        let keyValuePackageSource: Record<string, { name: string; id: number }> =
            {};
        packageVersions.forEach(pkg => {
            keyValuePackageVersions[pkg.packageName] = pkg.versions;
            keyValuePackageSource[pkg.packageName] = {
                name: pkg.sourceName,
                id: pkg.sourceId,
            };
        });

        projects.forEach(project => {
            project.packages.forEach(pkg => {
                let versions = keyValuePackageVersions[pkg.packageName];
                pkg.newerVersion = findStableVersion(versions);

                versions = mergeVersionPatterns(versions);

                pkg.isUpdated = isUpdate(pkg.packageVersion, pkg.newerVersion);
                pkg.versionList = versions;
                pkg.sourceName = keyValuePackageSource[pkg.packageName].name;
                pkg.sourceId = keyValuePackageSource[pkg.packageName].id;
            });
        });
    }
}

export async function loadProjects(
    workspacePath: readonly vscode.WorkspaceFolder[],
    config: ExtensionConfiguration,
    loadVersion: boolean = false
): Promise<Project[]> {
    const projectPathList: string[] = findProjects(workspacePath);

    let projectID = 1;
    let projectList: Project[] = [];

    // Cache props file data to avoid re-reading/re-parsing for projects sharing the same file
    const propsCache: Map<string, { xml: string; packages: PackageDetail[]; cpmEnabled: boolean }> = new Map();

    for (const pathIndex in projectPathList) {
        const projectPath = projectPathList[pathIndex];

        const originalData: string = readFileContent(projectPath);
        let projectName = path.basename(projectPath);

        // Detect CPM
        let isCpm = false;
        let propsFilePath: string | undefined;
        let propsPackages: PackageDetail[] = [];

        const foundPropsPath = findPropsFile(projectPath);
        if (foundPropsPath) {
            let cached = propsCache.get(foundPropsPath);
            if (!cached) {
                const propsXml = readFileContent(foundPropsPath);
                const cpmEnabled = isCpmEnabled(propsXml);
                const pkgs = cpmEnabled ? getPackageVersionsFromProps(propsXml) : [];
                cached = { xml: propsXml, packages: pkgs, cpmEnabled };
                propsCache.set(foundPropsPath, cached);
            }
            if (cached.cpmEnabled) {
                isCpm = true;
                propsFilePath = foundPropsPath;
                propsPackages = cached.packages;
            }
        }

        // Build a lookup map for central versions
        const centralVersionMap: Record<string, string> = {};
        if (isCpm) {
            propsPackages.forEach(p => {
                centralVersionMap[p.packageName] = p.packageVersion;
            });
        }

        let packages: PackageDetail[] = getPackages(originalData, {
            id: projectID + 1,
            projectName: projectName,
            projectPath: projectPath,
            packages: [],
            isCpm: isCpm,
            propsFilePath: propsFilePath,
        });

        projectList.push({
            id: projectID++,
            projectName: projectName,
            projectPath: projectPath,
            isCpm: isCpm,
            propsFilePath: propsFilePath,
            packages: packages.map(pkg => {
                // Resolve version: VersionOverride > Version attribute > central version
                let resolvedVersion = pkg.packageVersion;
                let isCentrallyManaged = false;
                let hasVersionOverride = false;

                if (isCpm) {
                    if (pkg.versionOverride) {
                        // Has VersionOverride — use that as the effective version
                        resolvedVersion = pkg.versionOverride;
                        hasVersionOverride = true;
                        isCentrallyManaged = false;
                    } else if (!pkg.packageVersion && centralVersionMap[pkg.packageName]) {
                        // No Version attr on PackageReference — resolve from props
                        resolvedVersion = centralVersionMap[pkg.packageName];
                        isCentrallyManaged = true;
                    } else if (!pkg.packageVersion) {
                        // CPM but no central version found — show empty
                        resolvedVersion = '';
                        isCentrallyManaged = true;
                    } else {
                        // Has Version attr directly (unusual in CPM but possible)
                        isCentrallyManaged = false;
                    }
                }

                return {
                    packageName: pkg.packageName,
                    packageVersion: resolvedVersion,
                    versionList: [resolvedVersion],
                    isUpdated: false,
                    newerVersion: 'Unknown',
                    sourceName: 'Unknown',
                    sourceId: null,
                    isCentrallyManaged: isCentrallyManaged,
                    hasVersionOverride: hasVersionOverride,
                };
            }),
        });
    }

    // Create virtual projects for unreferenced PackageVersion entries in each props file
    propsCache.forEach((cached, propsPath) => {
        if (!cached.cpmEnabled) { return; }

        // Collect all package names referenced by real projects sharing this props file
        // NuGet package names are case-insensitive, so normalise to lowercase for comparison
        const referencedPackages = new Set<string>();
        projectList.forEach(p => {
            if (p.isCpm && p.propsFilePath === propsPath && !p.isVirtualPropsProject) {
                p.packages.forEach(pkg => referencedPackages.add(pkg.packageName.toLowerCase()));
            }
        });

        // Find PackageVersion entries not referenced by any project
        const unreferenced = cached.packages.filter(
            pv => !referencedPackages.has(pv.packageName.toLowerCase())
        );

        if (unreferenced.length > 0) {
            projectList.push({
                id: projectID++,
                projectName: path.basename(propsPath),
                projectPath: propsPath,
                isCpm: true,
                propsFilePath: propsPath,
                isVirtualPropsProject: true,
                packages: unreferenced.map(pv => ({
                    packageName: pv.packageName,
                    packageVersion: pv.packageVersion,
                    versionList: [pv.packageVersion],
                    isUpdated: false,
                    newerVersion: 'Unknown',
                    sourceName: 'Unknown',
                    sourceId: null,
                    isCentrallyManaged: true,
                    hasVersionOverride: false,
                })),
            });
        }
    });

    if (loadVersion) {
        await setPackageVersions(config, projectList);
    }

    return projectList;
}

export async function reload(
    config: ExtensionConfiguration,
    workspacePath: readonly vscode.WorkspaceFolder[],
    loadVersion?: boolean
): Promise<FindProjectResult> {
    let commandResult: FindProjectResult;
    let projects = await loadProjects(workspacePath, config, loadVersion);
    if (projects && projects.length === 0) {
        commandResult = {
            message: `No project found in the selected workspace!`,
            isSuccessful: false,
            projectList: [],
        };
    } else {
        commandResult = { isSuccessful: true, projectList: projects };
    }
    return commandResult;
}

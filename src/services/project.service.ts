import * as vscode from 'vscode';
import glob = require('glob');
import { Project } from '../models/project.model';
import * as path from 'path';
import { PackageVersion, Package } from '../models/nuget.model';
import { fetchPackageVersionsBatch } from '../modules/nuget.module';
import { getPackages } from '../modules/xml.module';
import { mergeList } from '../modules/utils';
import { findStableVersion } from './common.service';
import { readFile } from '../modules/file.module';
import { ExtensionConfiguration } from '../models/option.model';
import { CommandResult, FindProjectResult } from '../models/common.model';

export function findProjects(workspaceFolder: readonly vscode.WorkspaceFolder[]): string[] {
    let result: string[] = [];

    workspaceFolder.forEach(folder => {
        let files = glob.sync(`${folder.uri.fsPath}/**/*.+(csproj|fsproj)`, {
            ignore: ['**/node_modules/**', '**/.git/**']
        });

        files.forEach(file => {
            if (result.indexOf(file) === -1) {
                result.push(file);
            }
        });
    });

    return result;
}


async function setPackageVersions(config: ExtensionConfiguration, projects: Project[]) {
    let hasPackage = projects.some(r => r.Packages && r.Packages.length > 0);
    if (hasPackage) {
        const allUniquePackages: string[] = mergeList(projects.map(q => q.Packages.map(e => e.PackageName)));

        let packageVersions: PackageVersion[] = (await fetchPackageVersionsBatch(allUniquePackages, config.nugetPackageVersionsUrls, config.nugetRequestTimeout));

        let keyValuePackageVersions: Record<string, string[]> = {}
        packageVersions.forEach(pkg => {
            keyValuePackageVersions[pkg.PackageName] = pkg.Versions;
        });

        projects.forEach(project => {
            project.Packages.forEach(pkg => {
                let versions = keyValuePackageVersions[pkg.PackageName];

                pkg.NewerVersion = findStableVersion(versions);
                pkg.IsUpdated = pkg.NewerVersion == pkg.PackageVersion;
                pkg.VersionList = versions;
            });
        });
    }

}

export async function loadProjects(workspacePath: readonly vscode.WorkspaceFolder[], config: ExtensionConfiguration, loadVersion: boolean = false): Promise<Project[]> {
    const projectPathList: string[] = findProjects(workspacePath);

    let projectID = 1;
    let projectList: Project[] = [];

    for (const pathIndex in projectPathList) {

        const projectPath = projectPathList[pathIndex];

        const originalData: string = readFile(projectPath);

        let packages: Package[] = getPackages(originalData);

        let projectName = path.basename(projectPath);

        projectList.push({
            ID: projectID++,
            ProjectName: projectName,
            ProjectPath: projectPath,
            Packages: packages.map((pkg) => {
                return {
                    PackageName: pkg.PackageName,
                    PackageVersion: pkg.PackageVersion,
                    VersionList: [pkg.PackageVersion],
                    IsUpdated: false,
                    NewerVersion: "Unknown"
                };
            })
        });

    }

    if (loadVersion) {
        await setPackageVersions(config, projectList);
    }

    return projectList;
}

export async function reload(config: ExtensionConfiguration, workspacePath: readonly vscode.WorkspaceFolder[], loadVersion?: boolean): Promise<FindProjectResult> {
    let commandResult: FindProjectResult;
    let projects = await loadProjects(workspacePath, config, loadVersion);
    if (projects && projects.length === 0) {
        commandResult = { Message: `No project found in the selected workspace!`, IsSuccessful: false, PorjectList: [] };
    } else {
        commandResult = { IsSuccessful: true, PorjectList: projects };
    }
    return commandResult;
}
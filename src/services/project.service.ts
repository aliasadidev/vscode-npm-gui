import * as vscode from 'vscode';
import glob = require('glob');
import { Project } from '../models/project.model';
import * as path from 'path';
import { PackageVersion, PackageDetail } from '../models/nuget.model';
import { fetchPackageVersionsBatch } from '../modules/nuget.module';
import { getPackages } from '../modules/xml.module';
import { mergeList } from '../modules/utils';
import {
  findStableVersion,
  isUpdate,
  mergeVersionPatterns,
} from './version.service';
import { readFileContent } from '../modules/file.module';
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

  for (const pathIndex in projectPathList) {
    const projectPath = projectPathList[pathIndex];

    const originalData: string = readFileContent(projectPath);
    let projectName = path.basename(projectPath);

    let packages: PackageDetail[] = getPackages(originalData, {
      id: projectID + 1,
      projectName: projectName,
      projectPath: projectPath,
      packages: [],
    });

    projectList.push({
      id: projectID++,
      projectName: projectName,
      projectPath: projectPath,
      packages: packages.map(pkg => {
        return {
          packageName: pkg.packageName,
          packageVersion: pkg.packageVersion,
          versionList: [pkg.packageVersion],
          isUpdated: false,
          newerVersion: 'Unknown',
          sourceName: 'Unknown',
          sourceId: null,
        };
      }),
    });
  }

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

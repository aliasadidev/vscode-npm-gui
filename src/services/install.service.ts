import { ExtensionConfiguration } from "../models/option.model";
import { Project } from "../models/project.model";
import { ServiceResult } from "../models/common.model";
import { readFileContent, writeToFile } from "../modules/file.module";
import { fetchPackageVersions } from "../modules/nuget.module";
import { addPackage } from "../modules/xml.module";
import { checkAccess, getProject } from "./common.service";
import { PackageVersion } from "../models/nuget.model";
import { findStableVersion } from "./version.service";

/**
 * Install a new package
 * @param config The config options
 * @param projectList The list of projects
 * @param projectID Project ID
 * @param packageName The package name
 * @param selectedVersion The target version
 * @returns
 */
export async function install(projectList: Project[], projectID: number, packageName: string, selectedVersion: string, config: ExtensionConfiguration): Promise<ServiceResult> {
  let commandResult: ServiceResult;
  const project = getProject(projectList, projectID);
  let pkgIsInstalled: boolean = false;

  if (project.packages && project.packages.length > 0) {
    const pkgIndex = project.packages.findIndex(e => e.packageName === packageName);
    pkgIsInstalled = pkgIndex !== -1;
  }

  if (pkgIsInstalled == false) {
    commandResult = checkAccess(project);
    if (commandResult.isSuccessful) {

      const projectFileContent = readFileContent(project.projectPath);
      const xml: string = addPackage(projectFileContent, packageName, selectedVersion, config.indentType);
      writeToFile(project.projectPath, xml);
      const pkgVersions: PackageVersion = await fetchPackageVersions(packageName, config.packageSources, config.requestTimeout, config.vscodeHttpConfig);

      const newerPackageVersion = findStableVersion(pkgVersions.versions);
      const isUpdated = newerPackageVersion == selectedVersion;

      project.packages.push({
        versionList: pkgVersions.versions,
        isUpdated: isUpdated,
        newerVersion: newerPackageVersion,
        packageName: packageName,
        packageVersion: selectedVersion,
        sourceName: pkgVersions.sourceName,
        sourceId: pkgVersions.sourceId
      });
      commandResult = { message: `${packageName} installed in ${project.projectName}`, isSuccessful: true };
    }
  } else {
    commandResult = { message: `${packageName} is installed before in ${project.projectName}`, isSuccessful: false };
  }
  return commandResult;
}



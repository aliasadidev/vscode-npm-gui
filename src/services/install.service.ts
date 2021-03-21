import { ExtensionConfiguration } from "../models/option.model";
import { Project } from "../models/project.model";
import { CommandResult } from "../models/common.model";
import { readFile, writeToFile } from "../modules/file.module";
import { fetchPackageVersions } from "../modules/nuget.module";
import { addPackage, updatePackage } from "../modules/xml.module";
import { checkAccess, findStableVersion, getPackage, getProject } from "./common.service";


export async function install(config: ExtensionConfiguration, projectList: Project[], projectID: number, packageName: string, selectedVersion: string): Promise<CommandResult> {
    let commandResult: CommandResult;
    const project = getProject(projectList, projectID);
    let pkgIsInstalled: boolean = false;

    if (project.Packages && project.Packages.length > 0) {
        const pkgIndex = project.Packages.findIndex(e => e.PackageName === packageName);
        pkgIsInstalled = pkgIndex !== -1;
    }

    if (pkgIsInstalled == false) {
        commandResult = checkAccess(project);
        if (commandResult.IsSuccessful) {

            const projectFileContent = readFile(project.ProjectPath);
            const xml: string = addPackage(projectFileContent, packageName, selectedVersion);
            writeToFile(project.ProjectPath, xml);

            const pkgVersions = (await fetchPackageVersions(packageName, config.nugetPackageVersionsUrls, config.nugetRequestTimeout)).Versions;
            const newerPackageVersion = findStableVersion(pkgVersions);
            const isUpdated = newerPackageVersion == selectedVersion;

            project.Packages.push({
                VersionList: pkgVersions,
                IsUpdated: isUpdated,
                NewerVersion: newerPackageVersion,
                PackageName: packageName,
                PackageVersion: selectedVersion
            });
            commandResult = { Message: `${packageName} installed in ${project.ProjectName}`, IsSuccessful: true };
        }
    } else {
        commandResult = { Message: `${packageName} is installed before in ${project.ProjectName}`, IsSuccessful: false };
    }
    return commandResult;
}



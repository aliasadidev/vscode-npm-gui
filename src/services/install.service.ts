import { ExtensionConfiguration } from "../models/option.model";
import { Project } from "../models/project.model";
import { ServiceResult } from "../models/common.model";
import { readFileContent, writeToFile } from "../modules/file.module";
import { fetchPackageVersions } from "../modules/nuget.module";
import { addPackage, updatePackage } from "../modules/xml.module";
import { checkAccess, findStableVersion, getPackage, getProject } from "./common.service";


export async function install(config: ExtensionConfiguration, projectList: Project[], projectID: number, packageName: string, selectedVersion: string): Promise<ServiceResult> {
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
            const xml: string = addPackage(projectFileContent, packageName, selectedVersion);
            writeToFile(project.projectPath, xml);

            const pkgVersions = (await fetchPackageVersions(packageName, config.nugetPackageVersionsUrls, config.nugetRequestTimeout)).Versions;
            const newerPackageVersion = findStableVersion(pkgVersions);
            const isUpdated = newerPackageVersion == selectedVersion;

            project.packages.push({
                versionList: pkgVersions,
                isUpdated: isUpdated,
                newerVersion: newerPackageVersion,
                packageName: packageName,
                packageVersion: selectedVersion
            });
            commandResult = { message: `${packageName} installed in ${project.projectName}`, isSuccessful: true };
        }
    } else {
        commandResult = { message: `${packageName} is installed before in ${project.projectName}`, isSuccessful: false };
    }
    return commandResult;
}



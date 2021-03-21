import { PackageDetail, Project } from "../models/project.model";
import { ServiceResult } from "../models/common.model";
import { hasFileAccess } from "../modules/file.module";
import * as fs from 'fs';

export function getProject(projectList: Project[], projectID: number): Project {
    let project = projectList.find(d => d.ID === projectID);
    if (project === undefined)
        throw "The project file does not exists";
    return project;
}
export function getPackage(project: Project, packageName: string): PackageDetail {
    let pkgIndex = getPackageIndex(project, packageName);
    return project.Packages[pkgIndex];
}

export function getPackageIndex(project: Project, packageName: string): number {
    let pkgIndex = project.Packages.findIndex(e => e.PackageName === packageName);
    if (pkgIndex === -1)
        throw `The selected package does not exists in '${project.ProjectName}' project`;
    return pkgIndex;
}

export function checkAccess(project: Project, mode: number = fs.constants.O_RDWR): ServiceResult {
    let commandResult: ServiceResult;
    let hasAccess = hasFileAccess(project.ProjectPath, mode);
    if (hasAccess.IsSuccessful) {
        commandResult = { IsSuccessful: true };
    } else {
        commandResult = {
            Message: hasAccess.ErrorMessage,
            IsSuccessful: false,
            Exception: hasAccess.Exception
        };
    }
    return commandResult;
}

/**
  * Find the latest stable version of a nuget package
  * @param versions The list of the package versions
  * @returns {string} If the version wasn't found the result is `Unknown`
  */
export function findStableVersion(versions: string[]): string {
    const regExp: RegExp = /^\d+\.\d+\.\d+(\.\d+)?$/m;
    let version: string | undefined = versions.slice().reverse().find(x => regExp.test(x));

    if (version === undefined && versions && versions.length > 0)
        version = versions[versions.length - 1];

    return version ?? "Unknown";
}
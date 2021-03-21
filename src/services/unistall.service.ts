import { Project } from "../models/project.model";
import { ServiceResult } from "../models/common.model";
import { readFileContent, writeToFile } from "../modules/file.module";
import { removePackage } from "../modules/xml.module";
import { checkAccess, getPackageIndex, getProject } from "./common.service";

export function remove(projectList: Project[], projectID: number, packageName: string): ServiceResult {
    const project = getProject(projectList, projectID);
    const pkgIndex = getPackageIndex(project, packageName);

    let commandResult = checkAccess(project);
    if (commandResult.IsSuccessful) {

        const projectFileContent = readFileContent(project.ProjectPath);
        const xmlContent: string = removePackage(projectFileContent, packageName);
        writeToFile(project.ProjectPath, xmlContent);

        project.Packages.splice(pkgIndex, 1);

        commandResult = {
            Message: `${packageName} removed from ${project.ProjectName}`,
            IsSuccessful: true
        };

    }

    return commandResult;
}

export function removeAllPackage(projectList: Project[], packageName: string) {
    let commandResultList: ServiceResult[] = [];

    projectList.forEach(project => {
        const packages = project.Packages.filter(x => x.PackageName == packageName);
        packages.forEach(pkg => {
            let commandResult = remove(projectList, project.ID, pkg.PackageName);
            if (commandResult.IsSuccessful) {
                commandResultList.push({ IsSuccessful: true, Message: `${project.ProjectName}|${pkg.PackageName}` });
            } else {
                commandResultList.push(commandResult);
            }
        });
    });

    return commandResultList;
}
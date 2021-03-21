import { Project } from "../models/project.model";
import { CommandResult } from "../models/common.model";
import { readFile, writeToFile } from "../modules/file.module";
import { updatePackage } from "../modules/xml.module";
import { checkAccess, getPackage, getProject } from "./common.service";


export function update(projectList: Project[], projectID: number, packageName: string, selectedVersion: string): CommandResult {
    const project = getProject(projectList, projectID);
    const pkg = getPackage(project, packageName);

    let commandResult = checkAccess(project);
    if (commandResult.IsSuccessful) {

        updatePackageInProjectFile(project.ProjectPath, pkg.PackageName, selectedVersion);

        pkg.IsUpdated = selectedVersion == pkg.NewerVersion;
        pkg.PackageVersion = selectedVersion;

        commandResult = {
            Message: `${pkg.PackageName} updated in ${project.ProjectName}`,
            IsSuccessful: true
        };
    }

    return commandResult;
}



export function updateAllPackage(projectList: Project[], packageName: string, selectedVersion: string): CommandResult[] {
    let commandResultList: CommandResult[] = [];

    projectList.forEach(project => {
        let pkgIndex = project.Packages.findIndex(e => e.PackageName === packageName);
        if (pkgIndex !== -1) {
            let commandResult = update(projectList, project.ID, packageName, selectedVersion);
            if (commandResult.IsSuccessful) {
                commandResultList.push({ IsSuccessful: true, Message: `${project.ProjectName}|${packageName}` });
            } else {
                commandResultList.push(commandResult);
            }
        }
    });
    return commandResultList;
}


export function updateAllProjects(projectList: Project[]): CommandResult[] {
    let commandResultList: CommandResult[] = [];

    projectList.forEach(project => {
        const packages = project.Packages.filter(x => x.IsUpdated == false);
        packages.forEach(pkg => {
            let commandResult = update(projectList, project.ID, pkg.PackageName, pkg.NewerVersion);
            if (commandResult.IsSuccessful) {
                commandResultList.push({ IsSuccessful: true, Message: `${project.ProjectName}|${pkg.PackageName}` });
            } else {
                commandResultList.push(commandResult);
            }
        });
    });

    return commandResultList;
}

function updatePackageInProjectFile(projectPath: string, packageName: string, selectedVersion: string) {
    const projectFileContent = readFile(projectPath);
    const xmlContent: string = updatePackage(projectFileContent, packageName, selectedVersion);
    writeToFile(projectPath, xmlContent);
}
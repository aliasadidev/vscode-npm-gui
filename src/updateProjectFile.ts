import { readFile, writeToFile } from './fileHelper';
import { addPackage, removePackage, updatePackage } from './xmlHelper';

export function updatePackageInProjectFile(projectPath: string, packageName: string, selectedVersion: string) {
    var projectFileContent = readFile(projectPath);
    const xml: string = updatePackage(projectFileContent, packageName, selectedVersion);
    writeToFile(projectPath, xml);
}


export function removePackageInProjectFile(projectPath: string, packageName: string) {

    var projectFileContent = readFile(projectPath);

    const xml: string = removePackage(projectFileContent, packageName);

    writeToFile(projectPath, xml);
}


export function installProjectFile(projectPath: string, pkgName: string, selectedVersion: string) {

    var projectFileContent = readFile(projectPath);

    const xml: string = addPackage(projectFileContent, pkgName, selectedVersion);

    writeToFile(projectPath, xml);
}
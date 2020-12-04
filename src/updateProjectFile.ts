import { readFile, writeToFile } from './fileHelper';

export function updateProjectFile(projectPath: string, oldMatchExperssion: string, selectedVersion: string): string {

    var projectFileContent = readFile(projectPath);

    var versionRegExp = /Version="([^"]*)"/g;
    var newMatchExperssion = oldMatchExperssion.replace(versionRegExp, `Version="${selectedVersion}"`);
    var newProjectFileContent = projectFileContent.replace(oldMatchExperssion, newMatchExperssion);

    writeToFile(projectPath, newProjectFileContent);
    return newMatchExperssion;
}


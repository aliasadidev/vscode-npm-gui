// import fs from 'fs';
import { glob } from 'glob';
import { readFile } from './fileHelper';
import { Package, Project } from './models';
import { fetchPackageVersions } from './nugetHelper';
import * as path from 'path'
import { resetStatusBarMessage, setStatusBarMessage } from './vscodeNotify';


export function findProjects(workspaceFolder: string): Array<string> {

    let files = glob.sync(`${workspaceFolder}/**/*.+(csproj|fsproj)`, {
        ignore: [
            '**/node_modules/**',
            '**/.git/**'
        ]
    });
    // console.log(files, "files");
    return files;
}


export async function loadProjects(workspacePath: string): Promise<Array<Project>> {
    const projectPathList: Array<string> = findProjects(workspacePath);

    var projectID = 1;
    var projectList: Array<Project> = [];

    for (const index in projectPathList) {

        const projectPath = projectPathList[index];
        setStatusBarMessage('Loading project file...');
        const originalData: string = readFile(projectPath);
        const regexComment: RegExp = /<!--[\s\S\n]*?-->/gm;
        const data: string = originalData.replace(regexComment, '')
        var regexp: RegExp = /PackageReference Include="([^"]*)" Version="([^"]*)"/g;
        var matches = data.matchAll(regexp);

        var packageList: Array<Package> = [];
        setStatusBarMessage('Loading package versions...');
        for (const group of matches) {
            const match = group[0], packageName = group[1], packageVersion = group[2];

            var versionList: Array<string> = [];
            // don't load a package that is loaded.
            const packageIsLoaded = firstOrDefaultPackage(projectList, packageName);
            if (packageIsLoaded)
                versionList = packageIsLoaded.VersionList;
            else {
                versionList = (await fetchPackageVersions(packageName)).versions;//versionList = ["1.0.0"];//for test                
            }
            var newPackageVersion = versionList[versionList.length - 1];
            var isUpdated = newPackageVersion == packageVersion;

            packageList.push({
                Match: match,
                PackageName: packageName,
                PackageVersion: packageVersion,
                VersionList: versionList,
                IsUpdated: isUpdated,
                NewerVersion: newPackageVersion
            });
        }

        var projectName = path.basename(projectPath);

        projectList.push({
            ID: projectID++,
            ProjectName: projectName,
            ProjectPath: projectPath,
            Packages: packageList
        });

    }
    resetStatusBarMessage();
    setStatusBarMessage('all packages loaded.', 1000);
    return projectList;
}

function firstOrDefaultPackage(projects: Array<Project>, packageName: string): Package | undefined {
    let result: Package | undefined;
    for (const proj in projects) {
        const element = projects[proj];
        let exist = element.Packages.find(x => x.PackageName === packageName);
        if (exist) {
            result = exist;
            break;
        }
    }
    return result;
}
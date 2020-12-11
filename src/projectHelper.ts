// import fs from 'fs';
import { glob } from 'glob';
import { readFile } from './fileHelper';
import { PackageDetail, PackageVersion, Package, Project } from './models';
import { fetchPackageVersions, fetchPackageVersionsBatch } from './nugetHelper';
import * as path from 'path'
import { resetStatusBarMessage, setStatusBarMessage } from './vscodeNotify';
import { getPackages } from './xmlHelper';


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


export async function loadProjects(workspacePath: string, loadVersion: boolean = false): Promise<Array<Project>> {
    const projectPathList: Array<string> = findProjects(workspacePath);

    var projectID = 1;
    var projectList: Array<Project> = [];

    for (const pathIndex in projectPathList) {

        const projectPath = projectPathList[pathIndex];
        setStatusBarMessage('Loading project file...');
        const originalData: string = readFile(projectPath);

        var packages: Array<Package> = getPackages(originalData);
        var packageVersions: Array<PackageVersion> = loadVersion ? await fetchPackageVersionsBatch(packages) : [];
        var packageList: Array<PackageDetail> = [];

        for (const pkg of packages) {
            const packageVersion = packages.filter(x => x.PackageName == pkg.PackageName)[0].PackageVersion;

            var versionList: Array<string> = loadVersion ?
                packageVersions.filter(x => x.PackageName == pkg.PackageName)[0].Versions :
                [packageVersion];
            // don't load a package that is loaded.
            // const packageIsLoaded = firstOrDefaultPackage(projectList, packageName);
            // if (packageIsLoaded)
            //     versionList = packageIsLoaded.VersionList;
            // else {
            //     versionList = (await fetchPackageVersions(packageName)).versions;//versionList = ["1.0.0"];//for test                
            // }
            var newPackageVersion = findStableVersion(versionList);
            var isUpdated = newPackageVersion == packageVersion;

            packageList.push({
                PackageName: pkg.PackageName,
                PackageVersion: packageVersion ? packageVersion : "unknown",
                VersionList: versionList,
                IsUpdated: isUpdated,
                NewerVersion: loadVersion ? newPackageVersion : "unknown"
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

// function firstOrDefaultPackage(projects: Array<Project>, packageName: string): PackageDetail | undefined {
//     let result: PackageDetail | undefined;
//     for (const proj in projects) {
//         const element = projects[proj];
//         let exist = element.Packages.find(x => x.PackageName === packageName);
//         if (exist) {
//             result = exist;
//             break;
//         }
//     }
//     return result;
// }

function findStableVersion(versions: Array<string>): string {
    const re: RegExp = /^\d+\.\d+\.\d+$/m;
    var version: string | undefined = versions.slice().reverse().find(x => re.test(x));
    return version ?? "unknown";

}
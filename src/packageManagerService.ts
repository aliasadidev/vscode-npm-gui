import * as fs from 'fs';
import * as path from 'path';
import { hasFileAccess, readFile, writeToFile } from "./fileHelper";
import { CommandResult, ExtensionConfiguration, Package, PackageDetail, PackageVersion, Project, SearchPackageResult } from "./models";
import { fetchPackageVersions, fetchPackageVersionsBatch, searchPackage } from "./nugetHelper";
import { addPackage, getPackages, removePackage, updatePackage } from "./xmlHelper";
import { findStableVersion, mergeList } from "./utils";
import glob = require('glob');
import { off } from 'process';

export class packageManagerService {

    private projectList: Array<Project> = [];
    private readonly config: ExtensionConfiguration;


    constructor(config: ExtensionConfiguration) {
        this.config = config;
    }

    private getProject(projectID: number): Project {
        var project = this.projectList.find(d => d.ID === projectID);
        if (project === undefined)
            throw "The project file does not exists";
        return project;
    }
    private getPackage(project: Project, packageName: string): PackageDetail {
        var pkgIndex = this.getPackageIndex(project, packageName);
        return project.Packages[pkgIndex];
    }

    private getPackageIndex(project: Project, packageName: string): number {
        var pkgIndex = project.Packages.findIndex(e => e.PackageName === packageName);
        if (pkgIndex === -1)
            throw `The selected package does not exists in '${project.ProjectName}' project`;
        return pkgIndex;
    }

    private findProjects(workspaceFolder: string): Array<string> {
        let files = glob.sync(`${workspaceFolder}/**/*.+(csproj|fsproj)`, {
            ignore: ['**/node_modules/**', '**/.git/**']
        });
        return files;
    }

    private checkAccess(project: Project, mode: number = fs.constants.O_RDWR): CommandResult {
        var commandResult: CommandResult;
        var hasAccess = hasFileAccess(project.ProjectPath, mode);
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

    private updatePackageInProjectFile(projectPath: string, packageName: string, selectedVersion: string) {
        const projectFileContent = readFile(projectPath);
        const xmlContent: string = updatePackage(projectFileContent, packageName, selectedVersion);
        writeToFile(projectPath, xmlContent);
    }

    get(): Array<Project> { return this.projectList };

    update(projectID: number, packageName: string, selectedVersion: string): CommandResult {
        const project = this.getProject(projectID);
        const pkg = this.getPackage(project, packageName);

        var commandResult = this.checkAccess(project);
        if (commandResult.IsSuccessful) {

            this.updatePackageInProjectFile(project.ProjectPath, pkg.PackageName, selectedVersion);

            pkg.IsUpdated = selectedVersion == pkg.NewerVersion;
            pkg.PackageVersion = selectedVersion;

            commandResult = {
                Message: `${pkg.PackageName} updated in ${project.ProjectName}`,
                IsSuccessful: true
            };
        }

        return commandResult;
    }


    remove(projectID: number, packageName: string): CommandResult {
        const project = this.getProject(projectID);
        const pkgIndex = this.getPackageIndex(project, packageName);

        var commandResult = this.checkAccess(project);
        if (commandResult.IsSuccessful) {

            const projectFileContent = readFile(project.ProjectPath);
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


    async install(projectID: number, packageName: string, selectedVersion: string): Promise<CommandResult> {
        var commandResult: CommandResult;
        const project = this.getProject(projectID);
        var pkgIsInstalled: boolean = false;

        if (project.Packages && project.Packages.length > 0) {
            const pkgIndex = project.Packages.findIndex(e => e.PackageName === packageName);
            pkgIsInstalled = pkgIndex !== -1;
        }

        if (pkgIsInstalled == false) {
            commandResult = this.checkAccess(project);
            if (commandResult.IsSuccessful) {

                const projectFileContent = readFile(project.ProjectPath);
                const xml: string = addPackage(projectFileContent, packageName, selectedVersion);
                writeToFile(project.ProjectPath, xml);

                const pkgVersions = (await fetchPackageVersions(packageName, this.config.nugetPackageVersionsUrl, this.config.nugetRequestTimeout)).versions;
                const newPackageVersion = pkgVersions[pkgVersions.length - 1];
                const isUpdated = newPackageVersion == selectedVersion;

                project.Packages.push({
                    VersionList: pkgVersions,
                    IsUpdated: isUpdated,
                    NewerVersion: newPackageVersion,
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



    updateAllPackage(packageName: string, selectedVersion: string): Array<CommandResult> {
        var commandResultList: Array<CommandResult> = [];

        this.projectList.forEach(project => {
            var pkgIndex = project.Packages.findIndex(e => e.PackageName === packageName);
            if (pkgIndex !== -1) {
                var commandResult = this.update(project.ID, packageName, selectedVersion);
                if (commandResult.IsSuccessful) {
                    commandResultList.push({ IsSuccessful: true, Message: `${project.ProjectName}|${packageName}` });
                } else {
                    commandResultList.push(commandResult);
                }
            }
        });
        return commandResultList;
    }


    updateAllProjects(): Array<CommandResult> {
        var commandResultList: Array<CommandResult> = [];

        this.projectList.forEach(project => {
            const packages = project.Packages.filter(x => x.IsUpdated == false);
            packages.forEach(pkg => {
                var commandResult = this.update(project.ID, pkg.PackageName, pkg.NewerVersion);
                if (commandResult.IsSuccessful) {
                    commandResultList.push({ IsSuccessful: true, Message: `${project.ProjectName}|${pkg.PackageName}` });
                } else {
                    commandResultList.push(commandResult);
                }
            });
        });

        return commandResultList;
    }


    removeAllPackage(packageName: string) {
        var commandResultList: Array<CommandResult> = [];

        this.projectList.forEach(project => {
            const packages = project.Packages.filter(x => x.PackageName == packageName);
            packages.forEach(pkg => {
                var commandResult = this.remove(project.ID, pkg.PackageName);
                if (commandResult.IsSuccessful) {
                    commandResultList.push({ IsSuccessful: true, Message: `${project.ProjectName}|${pkg.PackageName}` });
                } else {
                    commandResultList.push(commandResult);
                }
            });
        });

        return commandResultList;
    }


    async reload(workspacePath: string, loadVersion?: boolean): Promise<CommandResult> {
        var commandResult: CommandResult;
        var projects = await this.loadProjects(workspacePath, loadVersion);
        if (projects && projects.length === 0) {
            commandResult = { Message: "No project found in the selected workspace!", IsSuccessful: false };
        } else {
            this.projectList = projects;
            commandResult = { IsSuccessful: true };
        }
        return commandResult;
    }

    async searchPackage(query: string): Promise<SearchPackageResult | undefined> {
        var searchResult: SearchPackageResult | undefined;

        searchResult = await searchPackage(query,
            this.config.nugetSearchPackageUrl,
            this.config.nugetSearchPackagePreRelease,
            this.config.nugetSearchPackageDefaultTake,
            0,
            this.config.nugetRequestTimeout);

        return searchResult;
    }


    async setPackageVersions(projects: Array<Project>) {
        var hasPackage = projects.some(r => r.Packages && r.Packages.length > 0);
        if (hasPackage) {
            const allUniquePackages: Array<string> = mergeList(projects.map(q => q.Packages.map(e => e.PackageName)));

            var packageVersions: Array<PackageVersion> = (await fetchPackageVersionsBatch(allUniquePackages, this.config.nugetPackageVersionsUrl, this.config.nugetRequestTimeout));

            var keyValuePackageVersions: Record<string, string[]> = {}
            packageVersions.forEach(pkg => {
                keyValuePackageVersions[pkg.PackageName] = pkg.Versions;
            });

            projects.forEach(project => {
                project.Packages.forEach(pkg => {
                    var versions = keyValuePackageVersions[pkg.PackageName];

                    pkg.NewerVersion = findStableVersion(versions);
                    pkg.IsUpdated = pkg.NewerVersion == pkg.PackageVersion;
                    pkg.VersionList = versions;
                });
            });
        }

    }

    async loadProjects(workspacePath: string, loadVersion: boolean = false): Promise<Array<Project>> {
        const projectPathList: Array<string> = this.findProjects(workspacePath);

        var projectID = 1;
        var projectList: Array<Project> = [];

        for (const pathIndex in projectPathList) {

            const projectPath = projectPathList[pathIndex];

            const originalData: string = readFile(projectPath);

            var packages: Array<Package> = getPackages(originalData);

            var projectName = path.basename(projectPath);

            projectList.push({
                ID: projectID++,
                ProjectName: projectName,
                ProjectPath: projectPath,
                Packages: packages.map((pkg) => {
                    return {
                        PackageName: pkg.PackageName,
                        PackageVersion: pkg.PackageVersion,
                        VersionList: [pkg.PackageVersion],
                        IsUpdated: false,
                        NewerVersion: "Unknown"
                    };
                })
            });

        }

        if (loadVersion) {
            await this.setPackageVersions(projectList);
        }

        return projectList;
    }


}
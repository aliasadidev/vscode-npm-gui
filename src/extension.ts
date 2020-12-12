'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { VSCExpress } from 'vscode-express';
import { installProjectFile, removePackageInProjectFile, updatePackageInProjectFile } from './updateProjectFile';
import { Project, SearchPackageResult } from './models';
import { loadProjects } from './projectHelper';
import { resetStatusBarMessage, showErrorMessage, setStatusBarMessage } from './vscodeNotify';
import { fetchPackageVersions, searchPackage } from './nugetHelper';

export function activate(context: vscode.ExtensionContext) {

	const vscexpress = new VSCExpress(context, 'view');
	const workspacePath = vscode.workspace.rootPath;
	if (workspacePath === undefined) {
		showErrorMessage("Workdirectory is empty");
		throw "Workdirectory is empty";
	}

	var projectList: Array<Project> = [];
	let disposable = vscode.commands.registerCommand('nugetpackagemanagergui.view', async () => {
		vscexpress.open('index.html', 'Nuget Package Manager GUI', vscode.ViewColumn.One);
	});

	vscode.commands.registerCommand('nugetpackagemanagergui.getdata', () => {
		return projectList;
	});

	vscode.commands.registerCommand('nugetpackagemanagergui.updatePackage', (data: { ID: number, PackageName: string, SelectedVersion: string }) => {
		var project = projectList.filter(d => d.ID === data.ID)[0];
		var pkg = project.Packages.filter(e => e.PackageName === data.PackageName)[0];
		updatePackageInProjectFile(project.ProjectPath, pkg.PackageName, data.SelectedVersion);
		pkg.IsUpdated = data.SelectedVersion == pkg.NewerVersion;
		pkg.PackageVersion = data.SelectedVersion;
		setStatusBarMessage(`${data.PackageName} updated in ${project.ProjectName}`, 5000);
		return projectList;
	});

	vscode.commands.registerCommand('nugetpackagemanagergui.removePackage', (data: { ID: number, PackageName: string, SelectedVersion: string }) => {
		var project = projectList.filter(d => d.ID === data.ID)[0];
		var pkg = project.Packages.findIndex(e => e.PackageName === data.PackageName);
		removePackageInProjectFile(project.ProjectPath, project.Packages[pkg].PackageName)
		project.Packages.splice(pkg, 1);
		setStatusBarMessage(`${data.PackageName} removed from ${project.ProjectName}`, 5000);
		return projectList;
	});

	vscode.commands.registerCommand('nugetpackagemanagergui.installPackage', async (data: { ID: number, PackageName: string, SelectedVersion: string }) => {
		var project = projectList.filter(d => d.ID === data.ID)[0];
		var pkgIsInstalled: boolean = false;
		if (project.Packages && project.Packages.length > 0) {
			var pkgIndex = project.Packages.findIndex(x => x.PackageName == data.PackageName);
			pkgIsInstalled = pkgIndex != -1;
		}
		if (pkgIsInstalled == false) {
			installProjectFile(project.ProjectPath, data.PackageName, data.SelectedVersion);
			var pkgVersions = (await fetchPackageVersions(data.PackageName)).versions;
			var newPackageVersion = pkgVersions[pkgVersions.length - 1];
			var isUpdated = newPackageVersion == data.SelectedVersion;

			project.Packages.push({
				VersionList: pkgVersions,
				IsUpdated: isUpdated,
				NewerVersion: newPackageVersion,
				PackageName: data.PackageName,
				PackageVersion: data.SelectedVersion
			});

			setStatusBarMessage(`${data.PackageName} installed in ${project.ProjectName}`, 5000);
		} else {
			setStatusBarMessage(`${data.PackageName} installed before in ${project.ProjectName}`, 5000);
		}
		return projectList;
	});

	vscode.commands.registerCommand('nugetpackagemanagergui.updateAllPackage', (data: { ID: number, PackageName: string, SelectedVersion: string }) => {
		let pkgUpdatedList: Array<string> = [];
		projectList.forEach(project => {
			var pkg = project.Packages.filter(e => e.PackageName === data.PackageName);
			if (pkg && pkg.length > 0) {
				updatePackageInProjectFile(project.ProjectPath, pkg[0].PackageName, data.SelectedVersion);
				pkg[0].IsUpdated = data.SelectedVersion == pkg[0].NewerVersion;
				pkg[0].PackageVersion = data.SelectedVersion;
				pkgUpdatedList.push(project.ProjectName);
			}
		});
		if (pkgUpdatedList.length > 0) {
			setStatusBarMessage(`${data.PackageName} updated in Projects[${pkgUpdatedList.join('|')}]`, 5000)
		}
		return projectList;
	});
	vscode.commands.registerCommand('nugetpackagemanagergui.updateAllProjects', (data: {}) => {

		projectList.forEach(project => {
			var pkgs = project.Packages.filter(x => x.IsUpdated == false);
			pkgs.forEach(pkgItem => {
				updatePackageInProjectFile(project.ProjectPath, pkgItem.PackageName, pkgItem.NewerVersion);
				pkgItem.IsUpdated = true;
				pkgItem.PackageVersion = pkgItem.NewerVersion;
			});
		});

		return projectList;
	});

	vscode.commands.registerCommand('nugetpackagemanagergui.removeAllPackage', (data: { ID: number, PackageName: string }) => {
		let pkgUpdatedList: Array<string> = [];

		projectList.forEach(project => {
			var pkgIndex = project.Packages.findIndex(e => e.PackageName === data.PackageName);
			if (pkgIndex > -1) {
				removePackageInProjectFile(project.ProjectPath, project.Packages[pkgIndex].PackageName)
				project.Packages.splice(pkgIndex, 1);
				pkgUpdatedList.push(project.ProjectName);
			}
		});
		if (pkgUpdatedList.length > 0) {
			setStatusBarMessage(`${data.PackageName} removed in Projects[${pkgUpdatedList.join('|')}]`, 5000);
		}
		return projectList;
	});


	vscode.commands.registerCommand('nugetpackagemanagergui.reload', async (data: { LoadVersion?: boolean }) => {
		try {
			projectList = await loadProjects(workspacePath, data.LoadVersion);
			if (projectList.length == 0) {
				showErrorMessage("Projects not found!");
			}
		} catch (ex) {
			resetStatusBarMessage();
			console.log(ex);
		}
		return projectList;
	});


	vscode.commands.registerCommand('nugetpackagemanagergui.searchPackage', async (data: { Query: string }) => {
		var searchResult: SearchPackageResult | undefined;
		try {
			searchResult = await searchPackage(data.Query);
		} catch (ex) {
			resetStatusBarMessage();
			console.log(ex);
		}

		return searchResult;
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(vscode.commands.registerCommand('nugetpackagemanagergui.close', () => {
		vscexpress.close('index.html');
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
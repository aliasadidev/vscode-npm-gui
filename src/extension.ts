'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { VSCExpress } from 'vscode-express';
import { installProjectFile, removePackageInProjectFile, updatePackageInProjectFile } from './updateProjectFile';
import { Project, SearchPackageResult } from './models';
import { loadProjects } from './projectHelper';
import { resetStatusBarMessage, showErrorMessage, showInformationMessage } from './vscodeNotify';
import { searchPackage } from './nugetHelper';

export function activate(context: vscode.ExtensionContext) {

	const vscexpress = new VSCExpress(context, 'view');
	const workspacePath = context.asAbsolutePath("");
	if (workspacePath === undefined) {
		showErrorMessage("Workdirectory is empty");
		throw "Workdirectory is empty";
	}

	var projectList: Array<Project> = [];
	let disposable = vscode.commands.registerCommand('nugetpackagemanagergui.ui', async () => {
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
		return projectList;
	});

	vscode.commands.registerCommand('nugetpackagemanagergui.removePackage', (data: { ID: number, PackageName: string, SelectedVersion: string }) => {
		var project = projectList.filter(d => d.ID === data.ID)[0];
		var pkg = project.Packages.findIndex(e => e.PackageName === data.PackageName);
		removePackageInProjectFile(project.ProjectPath, project.Packages[pkg].PackageName)
		project.Packages.splice(pkg, 1);
		return projectList;
	});

	vscode.commands.registerCommand('nugetpackagemanagergui.installPackage', (data: { ID: number, PackageName: string, SelectedVersion: string }) => {
		var project = projectList.filter(d => d.ID === data.ID)[0];
		var pkgIsInstalled: boolean = false;
		if (project.Packages && project.Packages.length > 0) {
			var pkgIndex = project.Packages.findIndex(x => x.PackageName == data.PackageName);
			pkgIsInstalled = pkgIndex != -1;
		}
		if (pkgIsInstalled == false) {
			installProjectFile(project.ProjectPath, data.PackageName, data.SelectedVersion)
			showInformationMessage(`${data.PackageName} installed in ${project.ProjectName}`);
		} else {
			showInformationMessage(`${data.PackageName} installed before in ${project.ProjectName}`);
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
			showInformationMessage(`Projects updated:[${pkgUpdatedList.join('|')}]`)
		}
		return projectList;
	});

	vscode.commands.registerCommand('nugetpackagemanagergui.removeAllPackage', (data: { ID: number, PackageName: string }) => {
		let pkgUpdatedList: Array<string> = [];
		projectList.forEach(project => {
			var pkg = project.Packages.findIndex(e => e.PackageName === data.PackageName);
			removePackageInProjectFile(project.ProjectPath, project.Packages[pkg].PackageName)
			project.Packages.splice(pkg, 1);
			pkgUpdatedList.push(project.ProjectName);

		});
		if (pkgUpdatedList.length > 0) {
			showInformationMessage(`Projects updated:[${pkgUpdatedList.join('|')}]`)
		}
		return projectList;
	});


	vscode.commands.registerCommand('nugetpackagemanagergui.reload', async (data: { LoadVersion?: boolean }) => {
		try {
			projectList = await loadProjects(workspacePath, data.LoadVersion);
			if (projectList.length == 0) {
				showErrorMessage("Project file was not found")
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
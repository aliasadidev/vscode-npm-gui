'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { VSCExpress } from 'vscode-express';
import { updateProjectFile } from './updateProjectFile';
import { Project } from './models';
import { loadProjects } from './projectHelper';
import { resetStatusBarMessage, showErrorMessage, showInformationMessage } from './vscodeNotify';

export function activate(context: vscode.ExtensionContext) {

	const vscexpress = new VSCExpress(context, 'view');
	const workspacePath = vscode.workspace.rootPath;
	if (workspacePath === undefined) {
		showErrorMessage("Workdirectory is empty");
		throw "Workdirectory is empty";
	}
	console.log("workspacePath", workspacePath);
	var projectList: Array<Project> = [];
	let disposable = vscode.commands.registerCommand('nugetpackagemanagergui.ui', async () => {
		vscexpress.open('index.html', 'Nuget Package Manager GUI', vscode.ViewColumn.One);
	});

	vscode.commands.registerCommand('nugetpackagemanagergui.getdata', () => {
		return projectList;
	});

	vscode.commands.registerCommand('nugetpackagemanagergui.updatePackage', (data: { ID: number, PackageName: string, SelectedVersion: string }) => {

		console.log(data, "nugetpackagemanagergui.updatePackage");

		var proj = projectList.filter(d => d.ID === data.ID)[0];
		var pr = proj.Packages.filter(e => e.PackageName === data.PackageName)[0];
		var d = updateProjectFile(proj.ProjectPath, pr.Match, data.SelectedVersion)
		pr.Match = d;
		pr.IsUpdated = data.SelectedVersion == pr.NewerVersion;
		pr.PackageVersion = data.SelectedVersion;
		return null;
	});

	vscode.commands.registerCommand('nugetpackagemanagergui.updateAllPackage', (data: { ID: number, PackageName: string, SelectedVersion: string }) => {

		console.log(data, "nugetpackagemanagergui.updateAllPackage");
		let updatedList: Array<string> = [];
		projectList.forEach(proj => {
			var pr = proj.Packages.filter(e => e.PackageName === data.PackageName);
			if (pr && pr.length > 0) {
				var d = updateProjectFile(proj.ProjectPath, pr[0].Match, data.SelectedVersion);
				pr[0].Match = d;
				pr[0].IsUpdated = data.SelectedVersion == pr[0].NewerVersion;
				pr[0].PackageVersion = data.SelectedVersion;
				updatedList.push(proj.ProjectName)
			}
		});
		if (updatedList.length > 0) {
			showInformationMessage(`Projects updated:[${updatedList.join('|')}]`)
		}
		return null;
	});

	vscode.commands.registerCommand('nugetpackagemanagergui.reload', async () => {
		try {
			projectList = await loadProjects(workspacePath);
			if (projectList.length == 0) {
				showErrorMessage("No project file found")
			}
			console.log(projectList, "Project list:");
		} catch (ex) {
			resetStatusBarMessage();
			console.log(ex);
		}
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(vscode.commands.registerCommand('nugetpackagemanagergui.close', () => {
		vscexpress.close('index.html');
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
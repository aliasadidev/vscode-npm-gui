'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { VSCExpress } from 'vscode-express';
import { SearchPackageResult } from './models';
import * as pms from './packageManagerService';
import { showErrorMessage, setStatusBarMessage, resetStatusBarMessage, showInformationMessage } from './vscodeNotify';
import { getConfiguration, tryCatch } from './utils'

export function activate(context: vscode.ExtensionContext) {

	const vscexpress = new VSCExpress(context, 'view');
	const workspacePath = vscode.workspace.rootPath;
	if (workspacePath === undefined) {
		showErrorMessage("Workdirectory is empty!");
		throw "Workdirectory is empty!";
	}

	var configOptions = getConfiguration();
	const pmService = new pms.packageManagerService(configOptions);

	vscode.commands.registerCommand('nugetpackagemanagergui.getdata', () => {
		return pmService.get();
	});

	vscode.commands.registerCommand('nugetpackagemanagergui.reload', async (data: { LoadVersion?: boolean }) => {
		await tryCatch(async () => {
			setStatusBarMessage(data.LoadVersion ? 'Loading packages...' : 'Loading projects...');
			return pmService.reload(workspacePath, data.LoadVersion);
		}, data.LoadVersion ? 'All packages loaded.' : 'All projects loaded.');
		return pmService.get();
	});

	vscode.commands.registerCommand('nugetpackagemanagergui.searchPackage', async (data: { Query: string }) => {
		var searchResult: SearchPackageResult | undefined;
		try {
			searchResult = await pmService.searchPackage(data.Query);
		} catch (ex) {
			resetStatusBarMessage();
			showErrorMessage(ex);
		}
		return searchResult;
	});

	vscode.commands.registerCommand('nugetpackagemanagergui.updatePackage', async (data: { ID: number, PackageName: string, SelectedVersion: string }) => {
		await tryCatch(async () => {
			return pmService.update(data.ID, data.PackageName, data.SelectedVersion);
		});
	});


	vscode.commands.registerCommand('nugetpackagemanagergui.removePackage', async (data: { ID: number, PackageName: string }) => {
		await tryCatch(async () => {
			return pmService.remove(data.ID, data.PackageName);
		});
	});


	vscode.commands.registerCommand('nugetpackagemanagergui.removeAllPackage', async (data: { PackageName: string }) => {
		await tryCatch(async () => {
			return pmService.removeAllPackage(data.PackageName)
		}, undefined, true);
	});


	vscode.commands.registerCommand('nugetpackagemanagergui.updateAllProjects', async (data: {}) => {
		await tryCatch(async () => pmService.updateAllProjects(), undefined, true);
	});


	vscode.commands.registerCommand('nugetpackagemanagergui.installPackage', async (data: { ID: number, PackageName: string, SelectedVersion: string }) => {
		await tryCatch(async () => pmService.install(data.ID, data.PackageName, data.SelectedVersion), undefined, true);
	});


	vscode.commands.registerCommand('nugetpackagemanagergui.updateAllPackage', async (data: { ID: number, PackageName: string, SelectedVersion: string }) => {
		await tryCatch(async () => pmService.updateAllPackage(data.PackageName, data.SelectedVersion), undefined, true);
	});

	vscode.commands.registerCommand('nugetpackagemanagergui.showMessage', async (data: { Message: string, Type: string }) => {
		switch (data.Type) {
			case 'error': {
				showErrorMessage(data.Message);
				break;
			}
			case 'info': {
				showInformationMessage(data.Message)
				break;
			}
			default: {
				showErrorMessage(`An internal error has occurred,[Message Type '${data.Type}' not found}]`);
				break;
			}
		}
	});

	context.subscriptions.push(vscode.commands.registerCommand('nugetpackagemanagergui.view', () =>
		vscexpress.open('index.html', 'Nuget Package Manager GUI', vscode.ViewColumn.One))
	);
	context.subscriptions.push(vscode.commands.registerCommand('nugetpackagemanagergui.close', () => vscexpress.close('index.html')));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { VSCExpress } from './view';
import { showErrorMessage, setStatusBarMessage, resetStatusBarMessage, showInformationMessage, showCommandResults, showCommandResult } from './modules/notify.module';
import { PackageSearchResult } from './models/nuget.model';
import { getConfiguration } from './modules/config.module';
import { Project } from './models/project.model';
import { reload } from './services/project.service';
import { searchPackage } from './services/search-package.service';
import { update, updateAllPackage, updateAllProjects } from './services/update.service';
import { remove, removeAllPackage } from './services/uninstall.service';
import { install } from './services/install.service';

export function activate(context: vscode.ExtensionContext) {

  const vscexpress = new VSCExpress(context, 'front-end');
  const workspacePath = vscode.workspace.workspaceFolders;
  if (workspacePath === undefined) {
    showErrorMessage("Work directory is empty!");
    throw "Work directory is empty!";
  }

  const configOptions = getConfiguration();
  let projectList: Project[];

  vscode.commands.registerCommand('nugetpackagemanagergui.getData', () => {
    return projectList;
  });

  vscode.commands.registerCommand('nugetpackagemanagergui.reload', async (data: { loadVersion?: boolean }) => {
    await tryCatch(async () => {
      setStatusBarMessage(data.loadVersion ? 'Loading packages...' : 'Loading projects...');
      const result = await reload(configOptions, workspacePath, data.loadVersion);
      projectList = result.projectList;
      return result;
    }, data.loadVersion ? 'All packages loaded.' : 'All projects loaded.');
    return projectList;
  });

  vscode.commands.registerCommand('nugetpackagemanagergui.searchPackage', async (data: { query: string, skip: number, take: number, packageSourceId?: number }) => {
    let searchResult: PackageSearchResult[] | undefined;
    try {
      searchResult = await searchPackage(data.query, data.skip, data.take, configOptions, data.packageSourceId);
    } catch (ex) {
      resetStatusBarMessage();
      showErrorMessage(ex);
    }
    return searchResult;
  });

  vscode.commands.registerCommand('nugetpackagemanagergui.updatePackage', async (data: { id: number, packageName: string, selectedVersion: string }) => {
    await tryCatch(async () => {
      return update(projectList, data.id, data.packageName, data.selectedVersion, configOptions);
    });
  });


  vscode.commands.registerCommand('nugetpackagemanagergui.removePackage', async (data: { id: number, packageName: string }) => {
    await tryCatch(async () => {
      return remove(projectList, data.id, data.packageName, configOptions);
    });
  });

  vscode.commands.registerCommand('nugetpackagemanagergui.getPackageSources', () => {
    return configOptions.packageSources;
  });


  vscode.commands.registerCommand('nugetpackagemanagergui.removeAllPackage', async (data: { packageName: string }) => {
    await tryCatch(async () => {
      return removeAllPackage(projectList, data.packageName, configOptions);
    }, `${data.packageName} removed in all projects`, true);
  });


  vscode.commands.registerCommand('nugetpackagemanagergui.updateAllProjects', async (data: {}) => {
    await tryCatch(async () => updateAllProjects(projectList, configOptions), `All packages in the projects, updated with the latest stable version`, true);
  });


  vscode.commands.registerCommand('nugetpackagemanagergui.installPackage', async (data: { id: number, packageName: string, selectedVersion: string }) => {
    await tryCatch(async () => install(projectList, data.id, data.packageName, data.selectedVersion, configOptions), undefined, false);
  });


  vscode.commands.registerCommand('nugetpackagemanagergui.updateAllPackage', async (data: { packageName: string, selectedVersion: string }) => {
    await tryCatch(async () => updateAllPackage(projectList, data.packageName, data.selectedVersion, configOptions), `${data.packageName} updated in all projects`, true);
  });

  vscode.commands.registerCommand('nugetpackagemanagergui.showMessage', async (data: { message: string, type: string }) => {
    switch (data.type) {
      case 'error': {
        showErrorMessage(data.message);
        break;
      }
      case 'info': {
        showInformationMessage(data.message);
        break;
      }
      default: {
        showErrorMessage(`An internal error has occurred,[Message Type '${data.type}' not found}]`);
        break;
      }
    }
  });

  context.subscriptions.push(vscode.commands.registerCommand('nugetpackagemanagergui.view', () =>
    vscexpress.open('dist/nuget-ui/index.html', 'NuGet Package Manager GUI', vscode.ViewColumn.One))
  );
  context.subscriptions.push(vscode.commands.registerCommand('nugetpackagemanagergui.close', () => vscexpress.close('index.html')));
}

// this method is called when your extension is deactivated
export function deactivate() {
}

export async function tryCatch(action: any, successMessage: string | undefined = undefined, isListResult: boolean = false): Promise<any> {
  let result: any;
  try {
    result = await action();
    if (isListResult) {
      showCommandResults(result, successMessage);
    }
    else {
      showCommandResult(result, successMessage);
    }
  } catch (ex) {
    resetStatusBarMessage();
    showErrorMessage(ex);
  }
  return result;
}

'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { VSCExpress } from 'vscode-express';
import { showErrorMessage, setStatusBarMessage, resetStatusBarMessage, showInformationMessage } from './modules/notify.module';
import { tryCatch } from './modules/utils'
import { SearchPackageResult } from './models/nuget.model';
import { getConfiguration } from './modules/config.module';
import { Project } from './models/project.model';
import { reload } from './services/project.service';
import { searchPackage } from './services/search-package.service';
import { update, updateAllPackage, updateAllProjects } from './services/update.service';
import { remove, removeAllPackage } from './services/unistall.service';
import { install } from './services/install.service';

export function activate(context: vscode.ExtensionContext) {

  const vscexpress = new VSCExpress(context, 'front-end');
  const workspacePath = vscode.workspace.workspaceFolders;
  if (workspacePath === undefined) {
    showErrorMessage("Workdirectory is empty!");
    throw "Workdirectory is empty!";
  }

  const configOptions = getConfiguration();
  let projectList: Project[];

  vscode.commands.registerCommand('nugetpackagemanagergui.getdata', () => {
    return projectList;
  });

  vscode.commands.registerCommand('nugetpackagemanagergui.reload', async (data: { LoadVersion?: boolean }) => {
    await tryCatch(async () => {
      setStatusBarMessage(data.LoadVersion ? 'Loading packages...' : 'Loading projects...');
      const result = await reload(configOptions, workspacePath, data.LoadVersion);
      projectList = result.porjectList;
      return result;
    }, data.LoadVersion ? 'All packages loaded.' : 'All projects loaded.');
    return projectList;
  });

  vscode.commands.registerCommand('nugetpackagemanagergui.searchPackage', async (data: { Query: string, Skip: number, Take: number }) => {
    let searchResult: SearchPackageResult | undefined;
    try {
      searchResult = await searchPackage(data.Query, data.Skip, data.Take, configOptions);
    } catch (ex) {
      resetStatusBarMessage();
      showErrorMessage(ex);
    }
    return searchResult;
  });

  vscode.commands.registerCommand('nugetpackagemanagergui.updatePackage', async (data: { ID: number, PackageName: string, SelectedVersion: string }) => {
    await tryCatch(async () => {
      return update(projectList, data.ID, data.PackageName, data.SelectedVersion, configOptions);
    });
  });


  vscode.commands.registerCommand('nugetpackagemanagergui.removePackage', async (data: { ID: number, PackageName: string }) => {
    await tryCatch(async () => {
      return remove(projectList, data.ID, data.PackageName, configOptions);
    });
  });


  vscode.commands.registerCommand('nugetpackagemanagergui.removeAllPackage', async (data: { PackageName: string }) => {
    await tryCatch(async () => {
      return removeAllPackage(projectList, data.PackageName, configOptions)
    }, `${data.PackageName} removed in all projects`, true);
  });


  vscode.commands.registerCommand('nugetpackagemanagergui.updateAllProjects', async (data: {}) => {
    await tryCatch(async () => updateAllProjects(projectList, configOptions), `All packages in the projects, updated with the latest stable version`, true);
  });


  vscode.commands.registerCommand('nugetpackagemanagergui.installPackage', async (data: { ID: number, PackageName: string, SelectedVersion: string }) => {
    await tryCatch(async () => install(projectList, data.ID, data.PackageName, data.SelectedVersion, configOptions), undefined, false);
  });


  vscode.commands.registerCommand('nugetpackagemanagergui.updateAllPackage', async (data: { ID: number, PackageName: string, SelectedVersion: string }) => {
    await tryCatch(async () => updateAllPackage(projectList, data.PackageName, data.SelectedVersion, configOptions), `${data.PackageName} updated in all projects`, true);
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
    vscexpress.open('dist/nuget-ui/index.html', 'NuGet Package Manager GUI', vscode.ViewColumn.One))
  );
  context.subscriptions.push(vscode.commands.registerCommand('nugetpackagemanagergui.close', () => vscexpress.close('index.html')));
}

// this method is called when your extension is deactivated
export function deactivate() {
}
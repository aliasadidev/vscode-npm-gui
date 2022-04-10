import { ExtensionConfiguration, PackageSource } from "../models/option.model";
import * as vscode from 'vscode';

/**
 * Get the package configuration from VSCode
 */
export function getConfiguration(): ExtensionConfiguration {

  const packageSources = vscode.workspace.getConfiguration('nugetpackagemanagergui').get("packageSources") as PackageSource[];
  const indentType = vscode.workspace.getConfiguration('nugetpackagemanagergui').get("indentType") as string;
  const requestTimeout = vscode.workspace.getConfiguration('nugetpackagemanagergui').get("requestTimeout") as number;

  if (Array.isArray(packageSources)) {
    let i = 1;
    packageSources.forEach(x => x.id = i++);
  }

  return {
    indentType,
    packageSources,
    requestTimeout,
    vscodeHttpConfig: vscode.workspace.getConfiguration('http')
  };
}
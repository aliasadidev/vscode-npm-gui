import { ExtensionConfiguration } from "../models/option.model";
import * as vscode from 'vscode';

/**
 * Get the package configuration from VSCode
 */
export function getConfiguration(): ExtensionConfiguration {

    const nugetRequestTimeout = vscode.workspace.getConfiguration('nugetpackagemanagergui').get("nuget.requestTimeout") as number;
    const nugetPackageVersionsUrls = vscode.workspace.getConfiguration('nugetpackagemanagergui').get("nuget.packageVersionsUrls") as string[];
    const nugetSearchPackageUrls = vscode.workspace.getConfiguration('nugetpackagemanagergui').get("nuget.searchPackage.urls") as string[];
    const nugetSearchPackagePreRelease = vscode.workspace.getConfiguration('nugetpackagemanagergui').get("nuget.searchPackage.preRelease") as boolean;
    const nugetSearchPackageDefaultTake = vscode.workspace.getConfiguration('nugetpackagemanagergui').get("nuget.searchPackage.defaultTake") as number;

    return {
        nugetRequestTimeout,
        nugetPackageVersionsUrls: nugetPackageVersionsUrls,
        nugetSearchPackageUrls: nugetSearchPackageUrls,
        nugetSearchPackagePreRelease,
        nugetSearchPackageDefaultTake,
    };
}
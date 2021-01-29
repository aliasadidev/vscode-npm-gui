import * as vscode from 'vscode';
import { ExtensionConfiguration } from './models';
import { resetStatusBarMessage, showCommandResult, showCommandResults, showErrorMessage } from './vscodeNotify';


/**
 * Convert Json to QueryString 
 * @param json The Json data
 * @returns {string} `?` character is in the first position of the result
 */
export function jsonToQueryString(json: any) {
    return '?' +
        Object.keys(json).map(function (key) {
            return encodeURIComponent(key) + '=' +
                encodeURIComponent(json[key]);
        }).join('&');
}

/**
 * Find the latest stable version of a nuget package
 * @param versions The list of the package versions
 * @returns {string} If the version wasn't found the result is `Unknown`
 */
export function findStableVersion(versions: Array<string>): string {
    const regExp: RegExp = /^\d+\.\d+\.\d+(\.\d+)?$/m;
    let version: string | undefined = versions.slice().reverse().find(x => regExp.test(x));
    return version ?? "Unknown";
}

export function mergeList(arr: any) {
    return [...new Set([].concat(...arr))];
}

export async function tryCatch(action: any, successMessage: string | undefined = undefined, isListResult: boolean = false): Promise<any> {
    let result: any;
    try {
        result = await action();
        if (isListResult)
            showCommandResults(result, successMessage);
        else
            showCommandResult(result, successMessage);
    } catch (ex) {
        resetStatusBarMessage();
        showErrorMessage(ex);
    }
    return result;
}

export function getConfiguration(): ExtensionConfiguration {

    const nugetRequestTimeout = vscode.workspace.getConfiguration('nugetpackagemanagergui').get("nuget.requestTimeout") as number;
    const nugetPackageVersionsUrl = vscode.workspace.getConfiguration('nugetpackagemanagergui').get("nuget.packageVersionsUrl") as string[];
    const nugetSearchPackageUrl = vscode.workspace.getConfiguration('nugetpackagemanagergui').get("nuget.searchPackage.url") as string[];
    const nugetSearchPackagePreRelease = vscode.workspace.getConfiguration('nugetpackagemanagergui').get("nuget.searchPackage.preRelease") as boolean;
    const nugetSearchPackageDefaultTake = vscode.workspace.getConfiguration('nugetpackagemanagergui').get("nuget.searchPackage.defaultTake") as number;

    return {
        nugetRequestTimeout,
        nugetPackageVersionsUrl,
        nugetSearchPackageUrl,
        nugetSearchPackagePreRelease,
        nugetSearchPackageDefaultTake,
    };
}
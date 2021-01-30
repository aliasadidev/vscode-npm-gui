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

    if (version === undefined && versions && versions.length > 0)
        version = versions[versions.length - 1];

    return version ?? "Unknown";
}

export function mergeList(arr: any) {
    return [...new Set([].concat(...arr))];
}

export function uniqBy(arr: any[], key: string) {
    let seen = new Set();

    return arr.filter(it => {
        let val = it[key];
        if (seen.has(val)) {
            return false;
        } else {
            seen.add(val);
            return true;
        }
    });
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
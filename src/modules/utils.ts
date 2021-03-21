import { resetStatusBarMessage, showCommandResult, showCommandResults, showErrorMessage } from './notify.module';


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


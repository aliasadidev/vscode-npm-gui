import fetch from 'node-fetch';
import { PackageVersion, RequestOption } from './models';
import { getProxyOption } from './proxyHelper';
import { jsonToQueryString } from './utils';


function getRequestOptions(nugetRequestTimeout: number): RequestOption {
    const proxyOption = getProxyOption();
    const requestOption: RequestOption = {
        timeout: nugetRequestTimeout,
        headers: []
    };

    if (proxyOption.ProxyIsActive) {
        requestOption.agent = proxyOption.HttpsProxyAgent;
        if (proxyOption.headers)
            requestOption.headers.push(proxyOption.headers);
    }
    return requestOption
}


async function getPackageVersions(packageName: string, packageVersionsUrls: string[], requestOption: RequestOption): Promise<any> {

    let result;
    let lastError;
    for (let index = 0; index < packageVersionsUrls.length; index++) {
        try {
            let url = packageVersionsUrls[index].replace("{{packageName}}", packageName);
            result = undefined;
            result = await fetch(url, requestOption)
                .then(async response => {
                    const rawResult = await response.text();
                    let jsonResponse;
                    try {
                        jsonResponse = JSON.parse(rawResult);
                    } catch (ex) {
                        console.log(`[Nuget Package Manager GUI => ERROR!!!]\n[Request to url:${url}]\n[timeout:${requestOption.timeout}]\n[proxy is active:${!!requestOption.agent}]\n[result:${rawResult}]\n`);
                        throw ex;
                    }

                    return jsonResponse;
                })
                .then(jsonResponse => {
                    let result: PackageVersion = {
                        PackageName: packageName,
                        Versions: jsonResponse.versions
                    };
                    return result;
                })
                .catch(error => {
                    throw `[An error occurred in the loading package versions (package:${packageName})] ${error.message}`;
                });

        } catch (ex) {
            lastError = ex;
        }
        if (result) {
            lastError = undefined;
            break;
        }

    }
    if (lastError)
        throw lastError;

    return result;
}



export async function fetchPackageVersions(packageName: string, packageVersionsUrls: string[], nugetRequestTimeout: number): Promise<any> {
    const requestOption = getRequestOptions(nugetRequestTimeout);

    return getPackageVersions(packageName, packageVersionsUrls, requestOption);
}


export async function fetchPackageVersionsBatch(packages: Array<string>, packageVersionsUrls: string[], nugetRequestTimeout: number): Promise<any> {

    const requestOption = getRequestOptions(nugetRequestTimeout);

    let result = await Promise.all(
        packages.map(pkgName => getPackageVersions(pkgName, packageVersionsUrls, requestOption))
    );
    return result;
}

export async function searchPackage(query: string, searchPackageUrl: string[], preRelease: boolean, take: number, skip: number, nugetRequestTimeout: number): Promise<any> {
    const requestOption = getRequestOptions(nugetRequestTimeout);
    const queryString = jsonToQueryString({
        q: query,
        prerelease: preRelease,
        semVerLevel: "2.0.0",
        skip: skip,
        take: take
    });

    let result;
    let lastError;
    for (let index = 0; index < searchPackageUrl.length; index++) {
        try {
            let url = `${searchPackageUrl[index]}${queryString}`;
            result = undefined;
            result = await fetch(url, requestOption)
                .then(async response => {
                    const rawResult = await response.text();
                    let jsonResponse;
                    try {
                        jsonResponse = JSON.parse(rawResult);
                    } catch (ex) {
                        console.log(`[Nuget Package Manager GUI => ERROR!!!]\n[Request to url:${url}]\n[timeout:${requestOption.timeout}]\n[proxy is active:${!!requestOption.agent}]\n[result:${rawResult}]\n`);
                        throw ex;
                    }

                    return jsonResponse;
                })
                .catch(error => {
                    throw `[An error occurred in the searching package] ${error.message}`;
                });
        } catch (ex) {
            lastError = ex;
        }
        if (result) {
            lastError = undefined;
            break;
        }

    }
    if (lastError)
        throw lastError;

    return result;
}
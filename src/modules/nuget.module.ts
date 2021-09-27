import fetch from 'node-fetch';
import { PackageMetadata, PackageVersion, SearchPackageResult } from '../models/nuget.model';
import { RequestOption } from '../models/option.model';
import { getProxyOption } from './proxy.module';
import { jsonToQueryString, uniqBy } from './utils';

/**
 * Get the request options(proxy,timeout,...)
 * @param nugetRequestTimeout request timeout
 * @returns
 */
function getRequestOptions(nugetRequestTimeout: number): RequestOption {
    const proxyOption = getProxyOption();
    const requestOption: RequestOption = {
        timeout: nugetRequestTimeout,
        headers: []
    };

    if (proxyOption.proxyIsActive) {
        requestOption.agent = proxyOption.httpsProxyAgent;
        if (proxyOption.headers)
            requestOption.headers.push(proxyOption.headers);
    }
    return requestOption;
}
/**
 * Get The package versions
 * @param packageName The package name
 * @param packageVersionsUrls The nuget server url
 * @param requestOption The request options
 * @returns `PackageVersion`
 */
async function getPackageVersions(packageName: string, packageVersionsUrls: string[], requestOption: RequestOption): Promise<PackageVersion> {
    let result: PackageVersion | undefined | null;
    let hasError;
    for (let index = 0; index < packageVersionsUrls.length; index++) {
        try {
            //https://docs.microsoft.com/en-us/nuget/api/package-base-address-resource
            let url = packageVersionsUrls[index].replace("{{packageName}}", packageName?.toLowerCase());
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
                    let json: PackageVersion = {
                        packageName: packageName,
                        versions: jsonResponse.versions
                    };
                    return json;
                })
                .catch(error => {
                    throw `[An error occurred in the loading package versions (package:${packageName})] ${error.message}`;
                });

        } catch (ex) {
            hasError = ex;
        }
        if (result) {
            hasError = undefined;
            break;
        }

    }
    if (hasError)
        throw hasError;

    return <PackageVersion>result;
}

/**
 * Get The package versions
 * @param packageName The package name
 * @param packageVersionsUrls The nuget server url
 * @param requestOption The request options
 * @returns `PackageVersion`
 */
export async function fetchPackageVersions(packageName: string, packageVersionsUrls: string[], nugetRequestTimeout: number): Promise<PackageVersion> {
    const requestOption = getRequestOptions(nugetRequestTimeout);

    return getPackageVersions(packageName, packageVersionsUrls, requestOption);
}

/**
 * Get array of the `package versions`
 * @param packageName The package name
 * @param packageVersionsUrls The nuget server url
 * @param requestOption The request options
 * @returns `PackageVersion[]`
 */
export async function fetchPackageVersionsBatch(packages: string[], packageVersionsUrls: string[], nugetRequestTimeout: number): Promise<PackageVersion[]> {

    const requestOption = getRequestOptions(nugetRequestTimeout);

    let result = await Promise.all(
        packages.map(pkgName => getPackageVersions(pkgName, packageVersionsUrls, requestOption))
    );
    return result;
}
/**
 * Search for packages
 * @param query query
 * @param searchPackageUrls server address
 * @param preRelease true/false
 * @param take take items
 * @param skip skip items
 * @param nugetRequestTimeout request timeout
 * @returns list of packages
 */
export async function searchPackage(query: string, searchPackageUrls: string[], preRelease: boolean, take: number, skip: number, nugetRequestTimeout: number): Promise<SearchPackageResult> {
    const requestOption = getRequestOptions(nugetRequestTimeout);
    const queryString = jsonToQueryString({
        q: query,
        prerelease: preRelease,
        semVerLevel: "2.0.0",
        skip: skip,
        take: take
    });

    let packages: any[] = [];

    const results = await Promise.all(
        searchPackageUrls.map(async repoAddress => {
            let url = `${repoAddress}${queryString}`;
            return fetch(url, requestOption)
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
        }));

    let finalResult: PackageMetadata[] = [];
    let totalHits = 0;

    results.forEach(result => {
        packages = packages.concat(result.data);
        totalHits += result.totalHits;
    });



    if (results.length > 1) {
        const queryLowerCase = query.toLowerCase();
        const sortBy = () => {
            return (a: any, b: any) => {
                const r2 = a.id.toLowerCase().startsWith(queryLowerCase);
                const r1 = b.id.toLowerCase().startsWith(queryLowerCase);

                if (r1 && r2)
                    return b.totalDownloads - a.totalDownloads // both start with queryLowerCase
                else if (r1)
                    return 1;
                else if (r2)
                    return -1;
                else
                    return b.totalDownloads - a.totalDownloads;// Both don't start with queryLowerCase
            }
        };
        const packagesUniques = uniqBy(packages, "id");
        finalResult = packagesUniques.sort(sortBy());
        totalHits = packagesUniques.length;
    }
    else
        finalResult = packages;

    return { data: finalResult, totalHits: totalHits };
}
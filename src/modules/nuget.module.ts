import fetch from 'node-fetch';
import { PackageVersion } from '../models/nuget.model';
import { RequestOption } from '../models/option.model';
import { getProxyOption } from './proxy.module';
import { jsonToQueryString, uniqBy } from './utils';


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
                        packageName: packageName,
                        versions: jsonResponse.versions
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

export async function fetchPackageVersionsBatch(packages: string[], packageVersionsUrls: string[], nugetRequestTimeout: number): Promise<any> {

    const requestOption = getRequestOptions(nugetRequestTimeout);

    let result = await Promise.all(
        packages.map(pkgName => getPackageVersions(pkgName, packageVersionsUrls, requestOption))
    );
    return result;
}

export async function searchPackage(query: string, searchPackageUrls: string[], preRelease: boolean, take: number, skip: number, nugetRequestTimeout: number): Promise<any> {
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

    let finalResult: any[] = [];
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
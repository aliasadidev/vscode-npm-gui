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


async function fetchPackageVersionsBase(packageName: string, packageVersionsUrl: string, requestOption: RequestOption): Promise<any> {
    const result = fetch(`${packageVersionsUrl}/${packageName}/index.json`, requestOption)
        .then(response => {
            return response.json();
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

    return result;
}



export async function fetchPackageVersions(packageName: string, packageVersionsUrl: string, nugetRequestTimeout: number): Promise<any> {
    const requestOption = getRequestOptions(nugetRequestTimeout);

    return fetchPackageVersionsBase(packageName, packageVersionsUrl, requestOption);
}




export async function fetchPackageVersionsBatch(packages: Array<string>, packageVersionsUrl: string, nugetRequestTimeout: number): Promise<any> {

    const requestOption = getRequestOptions(nugetRequestTimeout);

    let result = await Promise.all(packages.map(pkgName =>
        fetchPackageVersionsBase(pkgName, packageVersionsUrl, requestOption)
    ));
    return result;
}


export async function searchPackage(query: string, searchPackageUrl: string, preRelease: boolean, take: number, skip: number, nugetRequestTimeout: number): Promise<any> {
    const requestOption = getRequestOptions(nugetRequestTimeout);
    const queryString = jsonToQueryString({
        q: query,
        prerelease: preRelease,
        semVerLevel: "2.0.0",
        skip: skip,
        take: take
    });

    let url = `${searchPackageUrl}${queryString}`;
    let result = await fetch(url, requestOption).then(response => {
        return response.json();
    }).catch(error => {
        throw `[An error occurred in the searching package] ${error.message}`;
    })

    return result;
}
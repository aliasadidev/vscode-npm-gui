import fetch from 'node-fetch';
import { PackageVersion } from './models';
import { jsonToQueryString } from './utils';

export async function fetchPackageVersions(packageName: string, packageVersionsUrl: string, nugetRequestTimeout: number): Promise<any> {
    const result = fetch(`${packageVersionsUrl}/${packageName}/index.json`, { timeout: nugetRequestTimeout })
        .then(response => {
            return response.json();
        })
        .then(jsonResponse => {
            var result: PackageVersion = {
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

export async function fetchPackageVersionsBatch(packages: Array<string>, packageVersionsUrl: string, timeout: number): Promise<any> {
    var result = await Promise.all(packages.map(pkgName =>
        fetchPackageVersions(pkgName, packageVersionsUrl, timeout)
    ));
    return result;
}


export async function searchPackage(query: string, searchPackageUrl: string, preRelease: boolean, take: number, skip: number, timeout: number): Promise<any> {

    const queryString = jsonToQueryString({
        q: query,
        prerelease: preRelease,
        semVerLevel: "2.0.0",
        skip: skip,
        take: take
    });

    var url = `${searchPackageUrl}${queryString}`;
    var result = await fetch(url, { timeout: timeout }).then(response => {
        return response.json();
    }).catch(error => {
        throw `[An error occurred in the searching package] ${error.message}`;
    })

    return result;
}
import fetch from 'node-fetch';
import { NUGET_SEARCH_URL, NUGET_VERSIONS_URL } from './constants';
import { PackageVersion, Package } from './models';
import { jsonToQueryString } from './utils';
import { showErrorMessage } from './vscodeNotify';

export async function fetchPackageVersions(selectedPackageName: string): Promise<any> {
    const result = await fetch(`${NUGET_VERSIONS_URL}${selectedPackageName}/index.json`, { timeout: 10000 })
        .then(response => {
            return response.json();
        })
        .catch(error => {
            showErrorMessage(`[An error occurred in the loading package version] 
             ${error.message}`);
            console.log(error);
            throw error;
        });


    return result;
}

export async function fetchPackageVersionsBatch(packages: Array<Package>): Promise<any> {

    var result = await Promise.all(packages.map(pkg =>
        fetch(`${NUGET_VERSIONS_URL}${pkg.PackageName}/index.json`).then(response => {
            return response.json();
        }).then(jsonResponse => {
            var result: PackageVersion = {
                PackageName: pkg.PackageName,
                Versions: jsonResponse.versions
            };
            return result;
        }).catch(error => {
            showErrorMessage(`[An error occurred in the loading package version] 
             ${error.message}`);
            console.log(error);
            throw error;
        })
    ));
    return result;
}


export async function searchPackage(query: string): Promise<any> {

    const queryString = jsonToQueryString({
        q: query,
        prerelease: false,
        semVerLevel: "2.0.0",
        take: 35
    });
    var url = `${NUGET_SEARCH_URL}${queryString}`;

    var result = await fetch(url).then(response => {
        return response.json();
    }).catch(error => {
        showErrorMessage(`[An error occurred in the package searching] 
         ${error.message}`);
        console.log(error);
        throw error;
    })

    return result;
}
import fetch from 'node-fetch';
import { NUGET_VERSIONS_URL } from './constants';
import { showErrorMessage } from './vscodeNotify';

export async function fetchPackageVersions(selectedPackageName: string): Promise<any> {
    //


    const response = await fetch(`${NUGET_VERSIONS_URL}${selectedPackageName}/index.json`, { timeout: 10000 })
        .then(response => {
            return response.json();
        })
        .catch(error => {
            showErrorMessage(`[An error occurred in the loading package version] 
             ${error.message}`);
            console.log(error);
            throw error;
        });


    return response;
}
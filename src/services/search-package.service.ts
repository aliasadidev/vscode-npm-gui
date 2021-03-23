import { SearchPackageResult } from "../models/nuget.model";
import { ExtensionConfiguration } from "../models/option.model";
import { searchPackage as searchPkg } from "../modules/nuget.module"

export async function searchPackage(query: string, config: ExtensionConfiguration): Promise<SearchPackageResult> {
    let searchResult: SearchPackageResult;

    searchResult = await searchPkg(query,
        config.nugetSearchPackageUrls,
        config.nugetSearchPackagePreRelease,
        config.nugetSearchPackageDefaultTake,
        0,
        config.nugetRequestTimeout);

    return searchResult;
}
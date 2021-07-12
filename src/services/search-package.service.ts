import { SearchPackageResult } from "../models/nuget.model";
import { ExtensionConfiguration } from "../models/option.model";
import { searchPackage as searchPkg } from "../modules/nuget.module"

export async function searchPackage(query: string, skip: number, take: number, config: ExtensionConfiguration): Promise<SearchPackageResult> {
    let searchResult: SearchPackageResult;

    searchResult = await searchPkg(query,
        config.nugetSearchPackageUrls,
        config.nugetSearchPackagePreRelease,
        take,
        skip,
        config.nugetRequestTimeout);

    return searchResult;
}
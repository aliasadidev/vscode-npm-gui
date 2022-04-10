import { PackageSearchResult } from "../models/nuget.model";
import { ExtensionConfiguration } from "../models/option.model";
import { searchPackage as searchPkg } from "../modules/nuget.module"

export async function searchPackage(query: string, skip: number, take: number, config: ExtensionConfiguration, packageSourceId?: number): Promise<PackageSearchResult[]> {
  let searchResult: PackageSearchResult[];

  searchResult = await searchPkg(query,
    config.packageSources,
    take,
    skip,
    config.requestTimeout,
    config.vscodeHttpConfig,
    packageSourceId
  );

  return searchResult;
}
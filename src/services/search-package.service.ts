import { PackageSearchResult } from '../models/nuget.model';
import { ExtensionConfiguration } from '../models/option.model';
import { searchPackage as searchPkg } from '../modules/nuget.module';
import { mergeVersionPatternsWithSearch } from './version.service';

export async function searchPackage(
  query: string,
  skip: number,
  take: number,
  config: ExtensionConfiguration,
  packageSourceId?: number
): Promise<PackageSearchResult[]> {
  let searchResult: PackageSearchResult[];

  searchResult = await searchPkg(
    query,
    config.packageSources,
    take,
    skip,
    config.requestTimeout,
    config.vscodeHttpConfig,
    packageSourceId
  );

  for (let i = 0; i < searchResult.length; i++) {
    const src = searchResult[i];
    if (src && src.packages && src.packages.length > 0) {
      for (let j = 0; j < src.packages.length; j++) {
        const pkg = src.packages[j];
        pkg.versions = mergeVersionPatternsWithSearch(pkg.versions);
      }
    }
  }

  return searchResult;
}

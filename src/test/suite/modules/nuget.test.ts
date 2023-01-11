import * as assert from 'assert';
import { PackageSearchResult, PackageVersion } from '../../../models/nuget.model';
import { fetchPackageVersions, searchPackage, fetchPackageVersionsBatch } from '../../../modules/nuget.module';
import { getConfigOptions } from './config';


suite('nuget.ts tests', () => {
  const configOptions = getConfigOptions();

  test('fetchPackageVersions test', async () => {
    const result: PackageVersion = await fetchPackageVersions('Microsoft.NET.Test.Sdk', configOptions.packageSources, configOptions.requestTimeout, configOptions.vscodeHttpConfig);
    assert(result.packageName != null && result.packageName != undefined);
    assert(result.versions != null && result.packageName != undefined && result.versions.length > 0);
  }).timeout(configOptions.requestTimeout);

  test('fetchPackageVersionsBatch test', async () => {
    const result: PackageVersion[] = await fetchPackageVersionsBatch(['Microsoft.NET.Test.Sdk', 'xunit'], configOptions.packageSources, configOptions.requestTimeout, configOptions.vscodeHttpConfig);

    assert(result != null && result != undefined && result.length == 2);

    assert(result[0].packageName != null && result[0].packageName != undefined);
    assert(result[0].versions != null && result[0].packageName != undefined && result[0].versions.length > 0);

    assert(result[1].packageName != null && result[1].packageName != undefined);
    assert(result[1].versions != null && result[1].packageName != undefined && result[1].versions.length > 0);
  }).timeout(configOptions.requestTimeout);


  test('searchPackage test', async () => {
    const packageName = 'Microsoft.NET.Test.Sdk';
    const result: PackageSearchResult[] = await searchPackage(
      packageName,
      configOptions.packageSources,
      1,
      0,
      configOptions.requestTimeout,
      configOptions.vscodeHttpConfig
    );

    assert(result != null && result != undefined && result[0].packages.length == 1);
    assert(result[0].packages[0].id == packageName);
  }).timeout(configOptions.requestTimeout);

});

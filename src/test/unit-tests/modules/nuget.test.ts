import * as assert from 'assert';
import { PackageVersion, SearchPackageResult } from '../../../models/nuget.model';
import { getConfiguration } from '../../../modules/config.module';
import { fetchPackageVersions, searchPackage, fetchPackageVersionsBatch } from '../../../modules/nuget.module';


suite('nuget.ts tests', () => {
  const configOptions = getConfiguration();

  test('fetchPackageVersions test', async () => {
    const result: PackageVersion = await fetchPackageVersions('Microsoft.NET.Test.Sdk', configOptions.nugetPackageVersionsUrls, configOptions.nugetRequestTimeout);
    assert(result.packageName != null && result.packageName != undefined)
    assert(result.versions != null && result.packageName != undefined && result.versions.length > 0)
  });

  test('fetchPackageVersionsBatch test', async () => {
    const result: PackageVersion[] = await fetchPackageVersionsBatch(['Microsoft.NET.Test.Sdk', 'xunit'], configOptions.nugetPackageVersionsUrls, configOptions.nugetRequestTimeout);

    assert(result != null && result != undefined && result.length == 2);

    assert(result[0].packageName != null && result[0].packageName != undefined);
    assert(result[0].versions != null && result[0].packageName != undefined && result[0].versions.length > 0);

    assert(result[1].packageName != null && result[1].packageName != undefined);
    assert(result[1].versions != null && result[1].packageName != undefined && result[1].versions.length > 0);
  });


  test('searchPackage test', async () => {
    const packageName = 'Microsoft.NET.Test.Sdk';
    const result: SearchPackageResult = await searchPackage(packageName,
      configOptions.nugetSearchPackageUrls,
      configOptions.nugetSearchPackagePreRelease,
      1,
      0,
      configOptions.nugetRequestTimeout
    );

    assert(result != null && result != undefined && result.data.length == 1);
    assert(result.data[0].id == packageName);
  });

});

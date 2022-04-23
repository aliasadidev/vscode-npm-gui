import * as assert from 'assert';
import { PackageSearchResult } from '../../../models/nuget.model';
import { searchPackage } from '../../../services/search-package.service';
import { getConfigOptions } from '../modules/config';



suite('search-package.service.ts tests', () => {
  const configOptions = getConfigOptions();

  test('searchPackage test', async () => {
    const packageName = 'Microsoft.NET.Test.Sdk';
    const result: PackageSearchResult[] | undefined = await searchPackage(
      packageName,
      0,
      10,
      configOptions);

    assert(result !== null && result !== undefined && result[0].packages.length > 1);
    assert(result[0].packages[0].id === packageName);
  });

});
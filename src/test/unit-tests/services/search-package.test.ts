import * as assert from 'assert';
import { SearchPackageResult } from '../../../models/nuget.model';
import { getConfiguration } from '../../../modules/config.module';
import { searchPackage } from '../../../services/search-package.service';



suite('search-package.service.ts tests', () => {
  const configOptions = getConfiguration();

  test('searchPackage test', async () => {
    const packageName = 'Microsoft.NET.Test.Sdk';
    const result: SearchPackageResult | undefined = await searchPackage(packageName, 0, 10, configOptions);

    assert(result != null && result != undefined && result.data.length > 1);
    assert(result.data[0].id == packageName);
  });

});

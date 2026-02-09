import * as assert from 'assert';
import { PackageDetail } from '../../../models/nuget.model';
import { getPackages } from '../../../modules/xml.module';

suite('xml.module.ts tests', () => {
  test('getPackages test', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
    <ItemGroup>
      <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
      <PackageReference Include="xunit" Version="2.4.1" />
    </ItemGroup>
</Project>`;

    const expected: PackageDetail[] = [
      { packageName: 'Microsoft.NET.Test.Sdk', packageVersion: '16.7.1', versionOverride: undefined },
      { packageName: 'xunit', packageVersion: '2.4.1', versionOverride: undefined },
    ];
    const packages = getPackages(xml, {
      id: 0,
      packages: [],
      projectName: '',
      projectPath: '',
      isCpm: false,
    });
    assert.deepStrictEqual(packages, expected);
  });
});

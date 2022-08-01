import * as assert from 'assert';
import { PackageDetail } from '../../../models/nuget.model';
import { addPackage, getPackages, removePackage, updatePackage } from '../../../modules/xml.module';


suite('xml.module.ts tests', () => {

  test('getPackages test', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup>
                           <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                           <PackageReference Include="xunit" Version="2.4.1" />
                         </ItemGroup>
                     </Project>`;

    const expected: PackageDetail[] = [
      { packageName: "Microsoft.NET.Test.Sdk", packageVersion: "16.7.1" },
      { packageName: "xunit", packageVersion: "2.4.1" },
    ];
    const packages = getPackages(xml);
    assert.deepStrictEqual(packages, expected);
  });

});


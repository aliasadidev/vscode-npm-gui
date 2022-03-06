import * as assert from 'assert';
import { PackageDetail } from '../../../models/nuget.model';
import { getConfiguration } from '../../../modules/config.module';
import { addPackage, getPackages, removePackage, updatePackage } from '../../../modules/xml.module';


suite('xml.module.ts tests', () => {
  const configOptions = getConfiguration();
  const indentType = !isNaN(parseFloat(configOptions.indentType)) ? ' '.repeat(parseFloat(configOptions.indentType)) : configOptions.indentType;


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


  test('removePackage test', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup>
                           <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                           <PackageReference Include="xunit" Version="2.4.1" />
                         </ItemGroup>
                     </Project>`;
    const expected = `<Project Sdk="Microsoft.NET.Sdk">\n${indentType.repeat(1)}<ItemGroup>\n${indentType.repeat(2)}<PackageReference Include="xunit" Version="2.4.1"/>\n${indentType.repeat(1)}</ItemGroup>\n</Project>`;
    const newXml = removePackage(xml, 'Microsoft.NET.Test.Sdk', indentType);
    assert.deepStrictEqual(newXml, expected);
  });

  test('updatePackage test', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup>
                           <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                           <PackageReference Include="xunit" Version="2.4.1" />
                         </ItemGroup>
                     </Project>`;

    const expected = `<Project Sdk="Microsoft.NET.Sdk">\n${indentType.repeat(1)}<ItemGroup>\n${indentType.repeat(2)}<PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.2"/>\n${indentType.repeat(2)}<PackageReference Include="xunit" Version="2.4.1"/>\n${indentType.repeat(1)}</ItemGroup>\n</Project>`;
    const newXml = updatePackage(xml, 'Microsoft.NET.Test.Sdk', '16.7.2', indentType);
    assert.deepStrictEqual(newXml, expected);
  });

  test('addPackage test', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup>
                           <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                         </ItemGroup>
                     </Project>`;

    const expected = `<Project Sdk="Microsoft.NET.Sdk">\n${indentType.repeat(1)}<ItemGroup>\n${indentType.repeat(2)}<PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1"/>\n${indentType.repeat(2)}<PackageReference Include="xunit" Version="2.4.1"/>\n${indentType.repeat(1)}</ItemGroup>\n</Project>`;
    const newXml = addPackage(xml, 'xunit', '2.4.1', indentType);
    assert.deepStrictEqual(newXml, expected);
  });

  test('addPackage test(package already exists in project!)', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup>
                           <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                         </ItemGroup>
                     </Project>`;

    const func = () => addPackage(xml, 'Microsoft.NET.Test.Sdk', '16.7.1', indentType);
    assert.throws(func, /package already exists in project!/);
  });

});

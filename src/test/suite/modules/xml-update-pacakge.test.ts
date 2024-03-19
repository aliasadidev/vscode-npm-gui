import * as assert from 'assert';
import { updatePackage } from '../../../modules/xml.module';

suite('xml.module.ts tests - update package', () => {
  test('updatePackage test', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup>
                           <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                           <PackageReference Include="xunit" Version="2.4.1" />
                         </ItemGroup>
                     </Project>`;

    const expected = xml.replace('16.7.1', '16.7.2');
    const newXml = updatePackage(xml, 'Microsoft.NET.Test.Sdk', '16.7.2');
    assert.deepStrictEqual(newXml, expected);
  });

  test('updatePackage test same indention - 1', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup>
                           <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                         </ItemGroup>
                     </Project>`;

    const expected = xml.replace('16.7.1', '16.7.2');
    const newXml = updatePackage(xml, 'Microsoft.NET.Test.Sdk', '16.7.2');
    assert.equal(newXml, expected);
  });

  test('updatePackage test same indention  - 2', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup>
                          <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                         </ItemGroup>
                         <!--Your comment-->
 </Project>`;

    const expected = xml.replace('16.7.1', '16.7.2');
    const newXml = updatePackage(xml, 'Microsoft.NET.Test.Sdk', '16.7.2');
    assert.equal(newXml, expected);
  });

  test('updatePackage test same indention  - 3', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
                                       <ItemGroup>
        <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                         </ItemGroup>
                         <!--Your comment-->
 </Project>`;

    const expected = xml.replace('16.7.1', '16.7.2');
    const newXml = updatePackage(xml, 'Microsoft.NET.Test.Sdk', '16.7.2');
    assert.equal(newXml, expected);
  });

  test('updatePackage test same indention  - 4', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <OutputPath></OutputPath>
        <OutputPath2></OutputPath2>
        <OutputPath33/>
    </PropertyGroup>

    <ItemGroup>
        <PackageReference Include="Dapper" Version="2.0.0"/>
        <PackageReference Include="Dapper2" Version="2.0.0" />
    </ItemGroup>

</Project>`;

    const expected = `<Project Sdk="Microsoft.NET.Sdk">
    <PropertyGroup>
        <OutputPath></OutputPath>
        <OutputPath2></OutputPath2>
        <OutputPath33 />
    </PropertyGroup>

    <ItemGroup>
        <PackageReference Include="Dapper" Version="2.0.1" />
        <PackageReference Include="Dapper2" Version="2.0.0" />
    </ItemGroup>

</Project>`;

    const newXml = updatePackage(xml, 'Dapper', '2.0.1');
    assert.equal(newXml, expected);
  });
});

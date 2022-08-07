import * as assert from 'assert';
import { Project } from '../../../models/project.model';
import { addPackage } from '../../../modules/xml.module';


suite('xml.module.ts tests - add package', () => {

  let project: Project;
  test('addPackage test', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup>
                           <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                         </ItemGroup>
                     </Project>`;
    const expected = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup>
                           <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                           <PackageReference Include="xunit" Version="2.4.1" />
                         </ItemGroup>
                     </Project>`;

    const newXml = addPackage(xml, 'xunit', '2.4.1', project);
    assert.deepStrictEqual(newXml, expected);
  });

  test('addPackage test(package already exists in project!)', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup>
                           <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                         </ItemGroup>
                     </Project>`;

    const func = () => addPackage(xml, 'Microsoft.NET.Test.Sdk', '16.7.1', project);
    assert.throws(func, /package already exists in project!/);
  });


  test('addPackage test - Indention 1', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup><PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                         </ItemGroup>
                     </Project>`;
    const expected = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup><PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" /><PackageReference Include="xunit" Version="2.4.1" />
                         </ItemGroup>
                     </Project>`;

    const newXml = addPackage(xml, 'xunit', '2.4.1', project);
    assert.deepStrictEqual(newXml, expected);
  });

  test('addPackage test - Indention 2', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
  </ItemGroup>
</Project>`;
    const expected = `<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
  </ItemGroup>
  <ItemGroup>
    <PackageReference Include="xunit" Version="2.4.1" />
  </ItemGroup>
</Project>`;

    const newXml = addPackage(xml, 'xunit', '2.4.1', project);
    assert.deepStrictEqual(newXml, expected);
  });

  test('addPackage test - Indention 3', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
        <ItemGroup>
        </ItemGroup>
</Project>`;
    const expected = `<Project Sdk="Microsoft.NET.Sdk">
        <ItemGroup>
        </ItemGroup>
        <ItemGroup>
                <PackageReference Include="xunit" Version="2.4.1" />
        </ItemGroup>
</Project>`;

    const newXml = addPackage(xml, 'xunit', '2.4.1', project);
    assert.deepStrictEqual(newXml, expected);
  });

  test('addPackage test - Indention 4 - Inline', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
    <ItemGroup><PackageReference Include="xunit" Version="2.4.1" /></ItemGroup>
</Project>`;
    const expected = `<Project Sdk="Microsoft.NET.Sdk">
    <ItemGroup><PackageReference Include="xunit" Version="2.4.1" /><PackageReference Include="xunit2" Version="2.4.1" /></ItemGroup>
</Project>`;

    const newXml = addPackage(xml, 'xunit2', '2.4.1', project);
    assert.deepStrictEqual(newXml, expected);
  });

  test('addPackage test - Indention 5', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
</Project>`;
    const expected = `<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <PackageReference Include="xunit" Version="2.4.1" />
  </ItemGroup>
</Project>`;
    const newXml = addPackage(xml, 'xunit', '2.4.1', project);
    assert.deepStrictEqual(newXml, expected);
  });


  test('addPackage test - Indention 6', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk"></Project>`;
    const expected = `<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <PackageReference Include="xunit" Version="2.4.1" />
  </ItemGroup>
</Project>`;
    const newXml = addPackage(xml, 'xunit', '2.4.1', project);
    assert.deepStrictEqual(newXml, expected);
  });


  test('addPackage test - Indention 7', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk"></Project>`;
    const expected = `<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <PackageReference Include="xunit" Version="2.4.1" />
  </ItemGroup>
</Project>`;
    const newXml = addPackage(xml, 'xunit', '2.4.1', project);
    assert.deepStrictEqual(newXml, expected);
  });

  test('addPackage test - Indention 8', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net6.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
</Project>`;
    const expected = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net6.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Newtonsoft.Json" Version="13.0.1" />
  </ItemGroup>
</Project>`;
    const newXml = addPackage(xml, 'Newtonsoft.Json', '13.0.1', project);
    assert.deepStrictEqual(newXml, expected);
  });


  test('addPackage test - Indention 9', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
<PropertyGroup>
<OutputType>Exe</OutputType>
<TargetFramework>net6.0</TargetFramework>
<ImplicitUsings>enable</ImplicitUsings>
</PropertyGroup>
</Project>`;
    const expected = `<Project Sdk="Microsoft.NET.Sdk">
<PropertyGroup>
<OutputType>Exe</OutputType>
<TargetFramework>net6.0</TargetFramework>
<ImplicitUsings>enable</ImplicitUsings>
</PropertyGroup>
<ItemGroup>
<PackageReference Include="Newtonsoft.Json" Version="13.0.1" />
</ItemGroup>
</Project>`;
    const newXml = addPackage(xml, 'Newtonsoft.Json', '13.0.1', project);
    assert.deepStrictEqual(newXml, expected);
  });



});


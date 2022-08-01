import * as assert from 'assert';
import { removePackage } from '../../../modules/xml.module';

suite('xml.module.ts tests - remove package', () => {

  test('removePackage test', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
    <ItemGroup>
       <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
       <PackageReference Include="xunit" Version="2.4.1" />
    </ItemGroup>
</Project>`;
    const expected = `<Project Sdk="Microsoft.NET.Sdk">
    <ItemGroup>
       <PackageReference Include="xunit" Version="2.4.1" />
    </ItemGroup>
</Project>`;
    const newXml = removePackage(xml, 'Microsoft.NET.Test.Sdk');
    assert.deepStrictEqual(newXml, expected);
  });


  test('remove test same indention - 1', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup>
                           <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                         </ItemGroup>
                     </Project>`;

    const expected = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup>
                         </ItemGroup>
                     </Project>`;

    const newXml = removePackage(xml, 'Microsoft.NET.Test.Sdk');
    assert.equal(newXml, expected);
  });

  test('remove test same indention - 2', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup><PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" /></ItemGroup>
                     </Project>`;

    const expected = `<Project Sdk="Microsoft.NET.Sdk">\n                         \n                     </Project>`;


    const newXml = removePackage(xml, 'Microsoft.NET.Test.Sdk');
    assert.equal(newXml, expected);
  });

  test('remove test same indention - 3', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">                         <ItemGroup><PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" /></ItemGroup>
                     </Project>`;

    const expected = `<Project Sdk="Microsoft.NET.Sdk">                         \n                     </Project>`;


    const newXml = removePackage(xml, 'Microsoft.NET.Test.Sdk');
    assert.equal(newXml, expected);
  });

  test('remove test same indention - 4', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk"><ItemGroup><PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" /></ItemGroup></Project>`;

    const expected = `<Project Sdk="Microsoft.NET.Sdk"></Project>`;


    const newXml = removePackage(xml, 'Microsoft.NET.Test.Sdk');
    assert.equal(newXml, expected);
  });

  test('remove test same indention - 5', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk"><ItemGroup><PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1"/></ItemGroup></Project>`;

    const expected = `<Project Sdk="Microsoft.NET.Sdk"></Project>`;


    const newXml = removePackage(xml, 'Microsoft.NET.Test.Sdk');
    assert.equal(newXml, expected);
  });


  test('remove test same indention - 6', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk"><!--Your comment--><ItemGroup><PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1"/></ItemGroup></Project>`;

    const expected = `<Project Sdk="Microsoft.NET.Sdk"><!--Your comment--></Project>`;


    const newXml = removePackage(xml, 'Microsoft.NET.Test.Sdk');
    assert.equal(newXml, expected);
  });

  test('remove test same indention - 7', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
    <ItemGroup><PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" /></ItemGroup></Project>`;

    const expected = `<Project Sdk="Microsoft.NET.Sdk">
    </Project>`;


    const newXml = removePackage(xml, 'Microsoft.NET.Test.Sdk');
    assert.equal(newXml, expected);
  });

});


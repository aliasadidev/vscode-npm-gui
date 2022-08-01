import * as assert from 'assert';
import { addPackage } from '../../../modules/xml.module';


suite('xml.module.ts tests - add package', () => {


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

    const newXml = addPackage(xml, 'xunit', '2.4.1');
    assert.deepStrictEqual(newXml, expected);
  });

  test('addPackage test(package already exists in project!)', () => {
    const xml = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup>
                           <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                         </ItemGroup>
                     </Project>`;

    const func = () => addPackage(xml, 'Microsoft.NET.Test.Sdk', '16.7.1');
    assert.throws(func, /package already exists in project!/);
  });

});


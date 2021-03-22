import * as assert from 'assert';
import { PackageDetail } from '../../../models/nuget.model';
import { addPackage, getPackages, removePackage, updatePackage } from '../../../modules/xml.module';
// const privateNugetModule = require('rewire')('../../../modules/xml.module');


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


    test('removePackage test', () => {
        const xml = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup>
                           <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                           <PackageReference Include="xunit" Version="2.4.1" />
                         </ItemGroup>
                     </Project>`;
        const expected = `<Project Sdk="Microsoft.NET.Sdk">\n  <ItemGroup>\n    <PackageReference Include="xunit" Version="2.4.1"/>\n  </ItemGroup>\n</Project>`;
        const newXml = removePackage(xml, 'Microsoft.NET.Test.Sdk');
        assert.deepStrictEqual(newXml, expected);
    });

    test('updatePackage test', () => {
        const xml = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup>
                           <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                           <PackageReference Include="xunit" Version="2.4.1" />
                         </ItemGroup>
                     </Project>`;

        const expected = '<Project Sdk="Microsoft.NET.Sdk">\n  <ItemGroup>\n    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.2"/>\n    <PackageReference Include="xunit" Version="2.4.1"/>\n  </ItemGroup>\n</Project>';
        const newXml = updatePackage(xml, 'Microsoft.NET.Test.Sdk', '16.7.2');
        assert.deepStrictEqual(newXml, expected);
    });

    test('addPackage test', () => {
        const xml = `<Project Sdk="Microsoft.NET.Sdk">
                         <ItemGroup>
                           <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
                         </ItemGroup>
                     </Project>`;

        const expected = '<Project Sdk="Microsoft.NET.Sdk">\n  <ItemGroup>\n    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1"/>\n    <PackageReference Include="xunit" Version="2.4.1"/>\n  </ItemGroup>\n</Project>';
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
        assert.throws(func, /package already exists in project!/)
    });

});

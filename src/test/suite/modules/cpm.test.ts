import * as assert from 'assert';
import { PackageDetail } from '../../../models/nuget.model';
import { Project } from '../../../models/project.model';
import {
    getPackages,
    isCpmEnabled,
    getPackageVersionsFromProps,
    addPackageVersion,
    updatePackageVersion,
    removePackageVersion,
    addPackageReferenceWithoutVersion,
    setVersionOverride,
    removeVersionOverride,
} from '../../../modules/xml.module';

suite('xml.module.ts tests - CPM (Central Package Management)', () => {
    let project: Project;

    setup(() => {
        project = {
            id: 1,
            projectName: 'Test.csproj',
            projectPath: '/test/Test.csproj',
            packages: [],
            isCpm: true,
            propsFilePath: '/test/Directory.Packages.props',
        };
    });

    // ======================== isCpmEnabled ========================

    test('isCpmEnabled - returns true when ManagePackageVersionsCentrally is true', () => {
        const propsXml = `<Project>
  <PropertyGroup>
  <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
  <ItemGroup>
  <PackageVersion Include="PackageA" Version="1.0.0" />
  </ItemGroup>
</Project>`;
        assert.strictEqual(isCpmEnabled(propsXml), true);
    });

    test('isCpmEnabled - returns false when ManagePackageVersionsCentrally is false', () => {
        const propsXml = `<Project>
  <PropertyGroup>
  <ManagePackageVersionsCentrally>false</ManagePackageVersionsCentrally>
  </PropertyGroup>
</Project>`;
        assert.strictEqual(isCpmEnabled(propsXml), false);
    });

    test('isCpmEnabled - returns false when ManagePackageVersionsCentrally is absent', () => {
        const propsXml = `<Project>
  <PropertyGroup>
  <TargetFramework>net6.0</TargetFramework>
  </PropertyGroup>
</Project>`;
        assert.strictEqual(isCpmEnabled(propsXml), false);
    });

    test('isCpmEnabled - returns true when property absent but PackageVersion elements exist', () => {
        const propsXml = `<Project>
  <ItemGroup>
  <PackageVersion Include="PackageA" Version="1.0.0" />
  </ItemGroup>
</Project>`;
        assert.strictEqual(isCpmEnabled(propsXml), true);
    });

    test('isCpmEnabled - returns false when explicitly false even with PackageVersion elements', () => {
        const propsXml = `<Project>
  <PropertyGroup>
  <ManagePackageVersionsCentrally>false</ManagePackageVersionsCentrally>
  </PropertyGroup>
  <ItemGroup>
  <PackageVersion Include="PackageA" Version="1.0.0" />
  </ItemGroup>
</Project>`;
        assert.strictEqual(isCpmEnabled(propsXml), false);
    });

    test('isCpmEnabled - returns false for invalid XML', () => {
        assert.strictEqual(isCpmEnabled('not valid xml'), false);
    });

    // ======================== getPackageVersionsFromProps ========================

    test('getPackageVersionsFromProps - extracts PackageVersion entries', () => {
        const propsXml = `<Project>
  <PropertyGroup>
  <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
  <ItemGroup>
  <PackageVersion Include="Newtonsoft.Json" Version="13.0.1" />
  <PackageVersion Include="xunit" Version="2.4.1" />
  </ItemGroup>
</Project>`;

        const expected: PackageDetail[] = [
            { packageName: 'Newtonsoft.Json', packageVersion: '13.0.1' },
            { packageName: 'xunit', packageVersion: '2.4.1' },
        ];
        const result = getPackageVersionsFromProps(propsXml);
        assert.deepStrictEqual(result, expected);
    });

    test('getPackageVersionsFromProps - returns empty for no PackageVersion elements', () => {
        const propsXml = `<Project>
  <PropertyGroup>
  <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
</Project>`;
        const result = getPackageVersionsFromProps(propsXml);
        assert.deepStrictEqual(result, []);
    });

    // ======================== getPackages with CPM ========================

    test('getPackages - reads PackageReference without Version (CPM)', () => {
        const xml = `<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <PackageReference Include="Newtonsoft.Json" />
    <PackageReference Include="xunit" />
  </ItemGroup>
</Project>`;

        const packages = getPackages(xml, project);
        assert.strictEqual(packages.length, 2);
        assert.strictEqual(packages[0].packageName, 'Newtonsoft.Json');
        assert.strictEqual(packages[0].packageVersion, '');
        assert.strictEqual(packages[1].packageName, 'xunit');
        assert.strictEqual(packages[1].packageVersion, '');
    });

    test('getPackages - reads VersionOverride attribute', () => {
        const xml = `<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <PackageReference Include="Newtonsoft.Json" VersionOverride="14.0.0" />
    <PackageReference Include="xunit" />
  </ItemGroup>
</Project>`;

        const packages = getPackages(xml, project);
        assert.strictEqual(packages[0].versionOverride, '14.0.0');
        assert.strictEqual(packages[1].versionOverride, undefined);
    });

    // ======================== addPackageVersion ========================

    test('addPackageVersion - adds to existing ItemGroup', () => {
        const propsXml = `<Project>
  <PropertyGroup>
  <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
  <ItemGroup>
  <PackageVersion Include="xunit" Version="2.4.1" />
  </ItemGroup>
</Project>`;

        const result = addPackageVersion(propsXml, 'Newtonsoft.Json', '13.0.1');
        assert.ok(result.includes('Include="Newtonsoft.Json"'));
        assert.ok(result.includes('Version="13.0.1"'));
        // Original entry should still be there
        assert.ok(result.includes('Include="xunit"'));
    });

    test('addPackageVersion - updates existing entry if package already exists', () => {
        const propsXml = `<Project>
  <PropertyGroup>
  <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
  <ItemGroup>
  <PackageVersion Include="xunit" Version="2.4.1" />
  </ItemGroup>
</Project>`;

        const result = addPackageVersion(propsXml, 'xunit', '2.5.0');
        assert.ok(result.includes('Version="2.5.0"'));
        // Should not have duplicate entries
        const matches = result.match(/Include="xunit"/g);
        assert.strictEqual(matches?.length, 1);
    });

    // ======================== updatePackageVersion ========================

    test('updatePackageVersion - updates version in props', () => {
        const propsXml = `<Project>
  <PropertyGroup>
  <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
  <ItemGroup>
  <PackageVersion Include="Newtonsoft.Json" Version="13.0.1" />
  </ItemGroup>
</Project>`;

        const result = updatePackageVersion(propsXml, 'Newtonsoft.Json', '13.0.3');
        assert.ok(result.includes('Version="13.0.3"'));
        assert.ok(!result.includes('Version="13.0.1"'));
    });

    test('updatePackageVersion - throws if package not found', () => {
        const propsXml = `<Project>
  <ItemGroup>
  <PackageVersion Include="xunit" Version="2.4.1" />
  </ItemGroup>
</Project>`;

        assert.throws(
            () => updatePackageVersion(propsXml, 'NonExistent', '1.0.0'),
            /not found/
        );
    });

    // ======================== removePackageVersion ========================

    test('removePackageVersion - removes entry from props', () => {
        const propsXml = `<Project>
  <PropertyGroup>
  <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
  <ItemGroup>
  <PackageVersion Include="Newtonsoft.Json" Version="13.0.1" />
  <PackageVersion Include="xunit" Version="2.4.1" />
  </ItemGroup>
</Project>`;

        const result = removePackageVersion(propsXml, 'Newtonsoft.Json');
        assert.ok(!result.includes('Newtonsoft.Json'));
        assert.ok(result.includes('xunit'));
    });

    test('removePackageVersion - throws if package not found', () => {
        const propsXml = `<Project>
  <ItemGroup>
  <PackageVersion Include="xunit" Version="2.4.1" />
  </ItemGroup>
</Project>`;

        assert.throws(
            () => removePackageVersion(propsXml, 'NonExistent'),
            /not found/
        );
    });

    // ======================== addPackageReferenceWithoutVersion ========================

    test('addPackageReferenceWithoutVersion - adds PackageReference without Version', () => {
        const xml = `<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <PackageReference Include="xunit" />
  </ItemGroup>
</Project>`;

        const result = addPackageReferenceWithoutVersion(xml, 'Newtonsoft.Json', project);
        assert.ok(result.includes('Include="Newtonsoft.Json"'));
        // Should NOT have a Version attribute on the new element
        // Check that there's no Version="..." immediately following Include="Newtonsoft.Json"
        const match = result.match(/Include="Newtonsoft.Json"\s*Version="/);
        assert.strictEqual(match, null);
    });

    test('addPackageReferenceWithoutVersion - throws if already exists', () => {
        const xml = `<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <PackageReference Include="xunit" />
  </ItemGroup>
</Project>`;

        assert.throws(
            () => addPackageReferenceWithoutVersion(xml, 'xunit', project),
            /package already exists/
        );
    });

    test('addPackageReferenceWithoutVersion - creates ItemGroup if none exists', () => {
        const xml = `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net6.0</TargetFramework>
  </PropertyGroup>
</Project>`;

        const result = addPackageReferenceWithoutVersion(xml, 'Newtonsoft.Json', project);
        assert.ok(result.includes('<ItemGroup>'));
        assert.ok(result.includes('Include="Newtonsoft.Json"'));
    });

    // ======================== setVersionOverride / removeVersionOverride ========================

    test('setVersionOverride - adds VersionOverride attribute', () => {
        const xml = `<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <PackageReference Include="xunit" />
  </ItemGroup>
</Project>`;

        const result = setVersionOverride(xml, 'xunit', '2.5.0');
        assert.ok(result.includes('VersionOverride="2.5.0"'));
    });

    test('removeVersionOverride - removes VersionOverride attribute', () => {
        const xml = `<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <PackageReference Include="xunit" VersionOverride="2.5.0" />
  </ItemGroup>
</Project>`;

        const result = removeVersionOverride(xml, 'xunit');
        assert.ok(!result.includes('VersionOverride'));
        assert.ok(result.includes('Include="xunit"'));
    });

    // ======================== Non-CPM backwards compatibility ========================

    test('getPackages - still works with Version attribute (non-CPM)', () => {
        const xml = `<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
      <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" />
      <PackageReference Include="xunit" Version="2.4.1" />
  </ItemGroup>
</Project>`;

        const expected: PackageDetail[] = [
            { packageName: 'Microsoft.NET.Test.Sdk', packageVersion: '16.7.1' },
            { packageName: 'xunit', packageVersion: '2.4.1' },
        ];
        const nonCpmProject: Project = {
            id: 0,
            packages: [],
            projectName: '',
            projectPath: '',
            isCpm: false,
        };
        const packages = getPackages(xml, nonCpmProject);
        assert.strictEqual(packages[0].packageName, expected[0].packageName);
        assert.strictEqual(packages[0].packageVersion, expected[0].packageVersion);
        assert.strictEqual(packages[1].packageName, expected[1].packageName);
        assert.strictEqual(packages[1].packageVersion, expected[1].packageVersion);
    });

    // ======================== isVirtualPropsProject model ========================

    test('Project model - isVirtualPropsProject defaults to undefined', () => {
        const proj: Project = {
            id: 1,
            projectName: 'Test.csproj',
            projectPath: '/test/Test.csproj',
            packages: [],
            isCpm: false,
        };
        assert.strictEqual(proj.isVirtualPropsProject, undefined);
    });

    test('Project model - isVirtualPropsProject can be set', () => {
        const proj: Project = {
            id: 99,
            projectName: 'Directory.Packages.props',
            projectPath: '/test/Directory.Packages.props',
            packages: [],
            isCpm: true,
            propsFilePath: '/test/Directory.Packages.props',
            isVirtualPropsProject: true,
        };
        assert.strictEqual(proj.isVirtualPropsProject, true);
        assert.strictEqual(proj.isCpm, true);
    });
});

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


	test('remove test same indention - Empty ItemGroup', () => {
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

	test('remove test same indention - Inline ItemGroup', () => {
		const xml = `<Project Sdk="Microsoft.NET.Sdk">
\t\t<ItemGroup><PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" /></ItemGroup>
</Project>`;

		const expected = `<Project Sdk="Microsoft.NET.Sdk">
\t\t<ItemGroup></ItemGroup>
</Project>`;


		const newXml = removePackage(xml, 'Microsoft.NET.Test.Sdk');
		assert.equal(newXml, expected);
	});

	test('remove test same indention - Inline ItemGroup with spaces', () => {
		const xml = `<Project Sdk="Microsoft.NET.Sdk">                         <ItemGroup><PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" /></ItemGroup>
</Project>`;

		const expected = `<Project Sdk="Microsoft.NET.Sdk">                         <ItemGroup></ItemGroup>
</Project>`;

		const newXml = removePackage(xml, 'Microsoft.NET.Test.Sdk');
		assert.equal(newXml, expected);
	});

	test('remove test same indention - 4', () => {
		const xml = `<Project Sdk="Microsoft.NET.Sdk"><ItemGroup>
    <PackageReference Include="xunit" Version="2.4.1" /><PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" /></ItemGroup></Project>`;

		const expected = `<Project Sdk="Microsoft.NET.Sdk"><ItemGroup>
    <PackageReference Include="xunit" Version="2.4.1" /></ItemGroup></Project>`;


		const newXml = removePackage(xml, 'Microsoft.NET.Test.Sdk');
		assert.equal(newXml, expected);
	});

	test('remove test same indention - 5', () => {
		const xml = `<Project Sdk="Microsoft.NET.Sdk"><ItemGroup><PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1"/></ItemGroup></Project>`;

		const expected = `<Project Sdk="Microsoft.NET.Sdk"><ItemGroup></ItemGroup></Project>`;


		const newXml = removePackage(xml, 'Microsoft.NET.Test.Sdk');
		assert.equal(newXml, expected);
	});


	test('remove test same indention - 6', () => {
		const xml = `<Project Sdk="Microsoft.NET.Sdk"><!--Your comment--><ItemGroup><PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1"/></ItemGroup></Project>`;

		const expected = `<Project Sdk="Microsoft.NET.Sdk"><!--Your comment--><ItemGroup></ItemGroup></Project>`;


		const newXml = removePackage(xml, 'Microsoft.NET.Test.Sdk');
		assert.equal(newXml, expected);
	});

	test('remove test same indention - 7', () => {
		const xml = `<!--Your comment--><Project Sdk="Microsoft.NET.Sdk">
    <!--Your comment--><ItemGroup><PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.7.1" /></ItemGroup></Project>`;

		const expected = `<!--Your comment--><Project Sdk="Microsoft.NET.Sdk">
    <!--Your comment--><ItemGroup></ItemGroup></Project>`;


		const newXml = removePackage(xml, 'Microsoft.NET.Test.Sdk');
		assert.equal(newXml, expected);
	});

});


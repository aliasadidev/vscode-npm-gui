import * as assert from 'assert';
import { getTestPath } from '../..';
import { checkFileAccess, checkFileExists, hasFileAccess, readFileContent, writeToFile } from '../../../modules/file.module';
import * as fs from 'fs';


suite('file.module.ts tests', () => {

  test('readFileContent test', () => {
    const filePath = getTestPath('readFileContent-test.csproj.xml');
    const xmlContent = readFileContent(filePath);
    assert(xmlContent != null)
  });

  test('writeToFile test', () => {
    const filePath = getTestPath('writeToFile-test.csproj.xml');
    writeToFile(filePath, "<test></test>");
    const newXmlContent = readFileContent(filePath);
    assert.deepStrictEqual(newXmlContent, '<test></test>')
  });

  test('checkFileExists test', () => {
    const filePath = getTestPath('writeToFile-test.csproj.xml');
    const exists = checkFileExists(filePath);

    assert.deepStrictEqual(exists.isSuccessful, true)
    assert.deepStrictEqual(exists.exception, undefined)
    assert.deepStrictEqual(exists.errorMessage, undefined)
  });

  test('checkFileExists test(not found)', () => {
    const filePath = getTestPath('writeToFile-test.csproj.xml2');
    const exists = checkFileExists(filePath);

    assert.deepStrictEqual(exists.isSuccessful, false)
    assert.deepStrictEqual(exists.exception, undefined)
    assert.deepStrictEqual(exists.errorMessage, `File "${filePath}" does not exists`)
  });

  test('checkFileAccess test', () => {
    const filePath = getTestPath('writeToFile-test.csproj.xml');
    const access = checkFileAccess(filePath, fs.constants.O_RDWR);

    assert.deepStrictEqual(access.isSuccessful, true)
    assert.deepStrictEqual(access.exception, undefined)
    assert.deepStrictEqual(access.errorMessage, undefined)
  });

  test('hasFileAccess test', () => {
    const filePath = getTestPath('writeToFile-test.csproj.xml');
    const access = hasFileAccess(filePath, fs.constants.O_RDWR);

    assert.deepStrictEqual(access.isSuccessful, true)
    assert.deepStrictEqual(access.exception, undefined)
    assert.deepStrictEqual(access.errorMessage, undefined)
  });

});

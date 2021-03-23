import * as assert from 'assert';
import * as vscode from 'vscode';
import { jsonToQueryString, uniqBy } from '../../../modules/utils';


suite('utils.ts tests', () => {

    test('uniqBy test', () => {
        const list: any[] = [
            { PackageName: "nugetpackagemanagergui", Versions: ["1", "2"] },
            { PackageName: "SixLaborsCaptcha.Core", Versions: ["1", "2"] },
        ];
        var uniqList = uniqBy([...list, { PackageName: "nugetpackagemanagergui", Versions: ["1", "2"] }], "PackageName");
        assert.deepStrictEqual(list, uniqList);
    });

    test('jsonToQueryString test', () => {
        const obj: any = { PackageName: "nugetpackagemanagergui", Versions: "12.22" };
        var query = jsonToQueryString(obj);
        assert.deepStrictEqual(query, `?PackageName=nugetpackagemanagergui&Versions=12.22`);
    });
});

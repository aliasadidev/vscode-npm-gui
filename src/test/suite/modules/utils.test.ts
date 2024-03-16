import * as assert from 'assert';
import { jsonToQueryString, uniqBy } from '../../../modules/utils';

suite('utils.ts tests', () => {
  test('uniqBy test', () => {
    const list: any[] = [
      { packageName: 'nugetpackagemanagergui', versions: ['1', '2'] },
      { packageName: 'SixLaborsCaptcha.Core', versions: ['1', '2'] },
    ];
    const uniqList = uniqBy(
      [
        ...list,
        { packageName: 'nugetpackagemanagergui', versions: ['1', '2'] },
      ],
      'packageName'
    );
    assert.deepStrictEqual(list, uniqList);
  });

  test('jsonToQueryString test', () => {
    const obj: any = {
      packageName: 'nugetpackagemanagergui',
      versions: '12.22',
    };
    const query = jsonToQueryString(obj);
    assert.deepStrictEqual(
      query,
      `?packageName=nugetpackagemanagergui&versions=12.22`
    );
  });
});

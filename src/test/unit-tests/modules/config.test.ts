import * as assert from 'assert';
import { getConfiguration } from '../../../modules/config.module';

suite('config.module.ts tests', () => {

    test('getConfiguration test(Does not throw)', () => {
        const func = () => getConfiguration();
        assert.doesNotThrow(func);
    });

    test('getConfiguration test', () => {
        const config = getConfiguration();
        assert(config != null);
    });
});

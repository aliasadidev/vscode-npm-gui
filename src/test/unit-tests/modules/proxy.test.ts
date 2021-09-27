import * as assert from 'assert';
import { getProxyOption } from '../../../modules/proxy.module';


suite('proxy.ts tests', () => {

  test('getProxyOption test', () => {
    const func = () => getProxyOption();
    assert.doesNotThrow(func);
  });

  test('getProxyOption test(not null)', () => {
    const proxyOption = getProxyOption();
    assert(proxyOption != null);
    assert(proxyOption.proxyIsActive != null);
  });

});

import * as url from 'url';
import { ProxyOption } from '../models/option.model';
var HttpsProxyAgent = require('https-proxy-agent');
/**
 * Get the proxy settings
 * @param vscodeHttpConfig vscode http config
 * @returns {ProxyOption}
 */
export function getProxyOption(vscodeHttpConfig: any): ProxyOption {
  // https://code.visualstudio.com/docs/setup/network
  // https://github.com/TooTallNate/node-https-proxy-agent/blob/master/src/agent.ts
  // VSCode injecting the proxyAuthorization property if the proxy has authorization
  let proxySetting: ProxyOption = { proxyIsActive: false };

  vscodeHttpConfig = vscodeHttpConfig ?? {};

  if (vscodeHttpConfig.proxy) {
    const parsedProxy = url.parse(vscodeHttpConfig.proxy);
    proxySetting.proxyIsActive = true;
    if (!parsedProxy.host || !parsedProxy.port)
      throw "Proxy address/port isn't valid!";

    const host: string = parsedProxy.host!,
      port: string = parsedProxy.port!,
      secureProxy: boolean = vscodeHttpConfig.proxyStrictSSL === true;

    proxySetting.httpsProxyAgent = new HttpsProxyAgent({
      host: host,
      port: port,
      secureProxy: secureProxy,
    });

    // Injecting the `Proxy-Authorization` header if the proxy has authorization
    if (vscodeHttpConfig.proxyAuthorization) {
      proxySetting.headers["Proxy-Authorization"] = vscodeHttpConfig.proxyAuthorization;
    }

  }
  return proxySetting;
}
import * as vscode from 'vscode';
import * as url from 'url';
import * as HttpsProxyAgent from 'https-proxy-agent';
import { ProxyOption } from '../models/option.model';
/**
 * Get the proxy settings
 * @returns {ProxyOption}
 */
export function getProxyOption(): ProxyOption {
  // https://code.visualstudio.com/docs/setup/network
  // https://github.com/TooTallNate/node-https-proxy-agent/blob/master/src/agent.ts
  // VSCode injecting the proxyAuthorization property if the proxy has authorization
  let proxySetting: ProxyOption = { proxyIsActive: false };
  var httpConfig = vscode.workspace.getConfiguration('http');

  if (httpConfig.proxy) {
    const parsedProxy = url.parse(httpConfig.proxy);
    proxySetting.proxyIsActive = true;
    if (!parsedProxy.host || !parsedProxy.port)
      throw "Proxy address/port isn't valid!";

    const host: string = parsedProxy.host!,
      port: string = parsedProxy.port!,
      secureProxy: boolean = httpConfig.proxyStrictSSL === true;

    proxySetting.httpsProxyAgent = new HttpsProxyAgent({
      host: host,
      port: port,
      secureProxy: secureProxy,
    });

    // Injecting the `Proxy-Authorization` header if the proxy has authorization
    if (httpConfig.proxyAuthorization) {
      proxySetting.headers = [];
      proxySetting.headers.push({
        'Proxy-Authorization': httpConfig.proxyAuthorization
      });
    }

  }
  return proxySetting;
}
import * as vscode from 'vscode';
import * as url from 'url';
import * as HttpsProxyAgent from 'https-proxy-agent';
import { ProxyOption } from '../models/option.model';

export function getProxyOption(): ProxyOption {
    // https://code.visualstudio.com/docs/setup/network
    // https://github.com/TooTallNate/node-https-proxy-agent/blob/master/src/agent.ts
    // VSCode inject the proxyAuthorization property if the proxy need the auth
    let proxySetting: ProxyOption = { ProxyIsActive: false };
    var httpConfig = vscode.workspace.getConfiguration('http');

    if (httpConfig.proxy) {
        const parsedProxy = url.parse(httpConfig.proxy);
        proxySetting.ProxyIsActive = true;
        if (!parsedProxy.host || !parsedProxy.port)
            throw "Proxy address/port isn't valid!";

        const host: string = parsedProxy.host!,
            port: string = parsedProxy.port!,
            secureProxy: boolean = httpConfig.proxyStrictSSL === true;

        proxySetting.HttpsProxyAgent = new HttpsProxyAgent({
            host: host,
            port: port,
            secureProxy: secureProxy,
        });

        // Inject the `Proxy-Authorization` header if necessary.
        if (httpConfig.proxyAuthorization) {
            proxySetting.headers = [];
            proxySetting.headers.push({
                'Proxy-Authorization': httpConfig.proxyAuthorization
            });
        }

    }
    return proxySetting;
}
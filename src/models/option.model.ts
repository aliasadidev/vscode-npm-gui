/**
 * The extension settings
 */
export interface ExtensionConfiguration {
  packageSources: PackageSource[],
  indentType: string;
  requestTimeout: number;
}

export interface PackageSource {
  id: number;
  sourceName: string;
  sourceType: SourceType;
  authorization: AuthorizationOption;
  searchUrl: string;
  packageVersionsUrl: string;
  preRelease: boolean;
}

export enum SourceType {
  remote = 1,
  local = 2
}
export enum AuthorizationType {
  none = 1,
  basicAuth = 2
}

export interface AuthorizationOption {
  authType: string,
  username: string;
  password: string;
}


/**
 *  The proxy settings
 */
export interface ProxyOption {
  /**
   * Is `true` when the proxy is active in vscode
   */
  proxyIsActive: boolean;
  /**
   * The HTTP/HTTPS proxy settings
   */
  httpsProxyAgent?: any;
  /**
   * The auth headers
   */
  headers?: any;
}
/**
 * The request settings for the all requests
 */
export interface RequestOption {
  /**
   * Filling in the proxy module
   */
  agent?: any;
  /**
   * Filling in the proxy module
   */
  headers: any;
  /**
   * Filling in the extension setting `nugetRequestTimeout`
   */
  timeout: number;
}
/**
 * The extension settings
 */
export interface ExtensionConfiguration {
  /**
   * The NuGet Package Registries
   */
  packageSources: PackageSource[],
  /**
   * The number of spaces to be used for indenting XML output
   */
  indentType: string;
  /**
   * The maximum duration for completing a request
   */
  requestTimeout: number;
}

/**
 * The package source model
 */
export interface PackageSource {
  /**
   * The package source id
   */
  id: number;
  /**
   * The package source name
   */
  sourceName: string;
  /**
   * The package source type
   */
  sourceType: SourceType;
  /**
   * The package source auth information
   */
  authorization: AuthorizationOption;
  /**
   * The NuGet endpoint address for searching packages
   */
  searchUrl: string;
  /**
   * The NuGet endpoint address for getting package versions
   */
  packageVersionsUrl: string;
  /**
   * true or false determining whether to include pre-release packages
   */
  preRelease: boolean;
}

/**
 * The package source types
 */
export enum SourceType {
  /**
   * The package source is hosted on a server
   */
  server = 1,
  /**
   * The package source is a directory [Unsupported yet!]
   */
  local = 2
}

/**
 * The auth types
 */
export enum AuthorizationType {
  /**
   * The endpoint doesn't need an auth token
   */
  none = 1,
  /**
   * The endpoint needs an auth token
   */
  basicAuth = 2
}

/**
 * The auth option
 */
export interface AuthorizationOption {
  /**
   * The auth type
   */
  authType: string;
  /**
   * The username
   */
  username: string;
  /**
   * The access token key
   */
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
/**
 * The extension settings
 */
export interface ExtensionConfiguration {
  /**
   * The maximum duration for completing a request from this extension
   */
  nugetRequestTimeout: number;
  /**
   * `https://api.nuget.org/v3-flatcontainer/{{packageName}}/index.json`
   *
   * The NuGet endpoint addresses for getting package versions
   *
   * The first address in the list has highest priority
   *
   * The {{packageName}} property injecting by extension
   */
  nugetPackageVersionsUrls: string[];
  /**
   * `https://azuresearch-usnc.nuget.org/query`
   *
   * The NuGet endpoint addresses for searching packages
   *
   * The first address in the list has highest priority
   */
  nugetSearchPackageUrls: string[];
  /**
   * `true` or `false` determining whether to include pre-release packages in the result of the search
   */
  nugetSearchPackagePreRelease: boolean;
  /**
   * The number of packages to return in the search result
   */
  nugetSearchPackageDefaultTake: number;
  /**
   * The number of spaces to be used for indenting XML output. Passing characters like ' ' or '\t' are also accepted
  */
  indentType: string;
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
  headers?: any[];
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
  headers: any[];
  /**
   * Filling in the extension setting `nugetRequestTimeout`
   */
  timeout: number;
}
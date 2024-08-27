import fetch from 'node-fetch';
const base64 = require('base-64');
const utf8 = require('utf8');
import {
  PackageMetadata,
  PackageSearchResult,
  PackageVersion,
  SearchPackageResultVersion,
  ServerPackageSearchResult,
} from '../models/nuget.model';
import {
  AuthorizationOption,
  AuthorizationType,
  PackageSource,
  RequestOption,
  SourceType,
} from '../models/option.model';
import { getProxyOption } from './proxy.module';
import { EOL, jsonToQueryString, mergeList } from './utils';
import { showErrorMessage } from './notify.module';
import { localGetPackageVersions, localSearchPackage } from './local.module';
import { sortVersions } from '../services/version.service';

/**
 * Get the request options(proxy,timeout,...)
 * @param authOption package source auth option
 * @param nugetRequestTimeout request timeout
 * @param vscodeHttpConfig vscode http config
 * @returns
 */
function getRequestOptions(
  authOption: AuthorizationOption | null,
  nugetRequestTimeout: number,
  vscodeHttpConfig: any
): RequestOption {
  const proxyOption = getProxyOption(vscodeHttpConfig);
  const requestOption: RequestOption = {
    timeout: nugetRequestTimeout,
    headers: {},
  };

  if (proxyOption.proxyIsActive) {
    requestOption.agent = proxyOption.httpsProxyAgent;
    if (proxyOption.headers) {
      requestOption.headers.push(proxyOption.headers);
    }
  }

  if (authOption?.authType == AuthorizationType[AuthorizationType.basicAuth]) {
    var bytes = utf8.encode(authOption.username + ':' + authOption.password);
    var encoded = base64.encode(bytes);
    requestOption.headers['Authorization'] = 'Basic ' + encoded;
  }

  return requestOption;
}
/**
 * Get The package versions
 * @param packageName The package name
 * @param packageVersionsUrls The nuget server url
 * @param requestOption The request options
 * @param vscodeHttpConfig vscode http config
 * @returns `PackageVersion`
 */
async function getPackageVersions(
  packageName: string,
  packageSources: PackageSource[],
  nugetRequestTimeout: number,
  vscodeHttpConfig: any
): Promise<PackageVersion> {
  let result: PackageVersion | undefined | null;
  let errors: string[] = [];
  try {
    result = await Promise.any(
      packageSources
        .filter(x => x.sourceType.toString() != SourceType[SourceType.local])
        .map(async src => {
          let url = src.packageVersionsUrl.replace(
            '{{packageName}}',
            packageName?.toLowerCase()
          );
          const requestOption = getRequestOptions(
            src.authorization,
            nugetRequestTimeout,
            vscodeHttpConfig
          );
          return await fetch(url, requestOption)
            .then(async response => {
              const rawResult = await response.text();
              let jsonResponse;
              try {
                jsonResponse = JSON.parse(rawResult);
                if (
                  (jsonResponse && !Array.isArray(jsonResponse.versions)) ||
                  (Array.isArray(jsonResponse.versions) &&
                    jsonResponse.versions.length == 0)
                ) {
                  throw 'not found';
                }
              } catch (ex) {
                errors.push(`
            [NuGet Package Manager GUI => ERROR!!!]
            [Request to url:${url}]
            [timeout:${nugetRequestTimeout}]
            [proxy is active:${!!requestOption.agent}]
            [auth is active:${src.authorization && src.authorization.authType != AuthorizationType[AuthorizationType.none]}]
            [result:${rawResult}]${EOL}`);
                throw ex;
              }

              return jsonResponse;
            })
            .then(jsonResponse => {
              let json: PackageVersion = {
                packageName: packageName,
                versions: jsonResponse.versions,
                sourceName: src.sourceName,
                sourceId: src.id,
              };
              return json;
            })
            .catch(error => {
              throw `[An error occurred in the loading package versions (package:${packageName})] ${error.message}`;
            });
        })
    );
  } catch (e) {
    console.log(e);
    showErrorMessage(errors);
    throw `[An error occurred in the loading package versions (package:${packageName})] details logged in VSCode developer tools`;
  }

  return <PackageVersion>result;
}

/**
 * Get The package versions
 * @param packageName The package name
 * @param packageVersionsUrls The nuget server url
 * @param requestOption The request options
 * @param vscodeHttpConfig vscode http config
 * @returns `PackageVersion`
 */
export async function fetchPackageVersions(
  packageName: string,
  packageSources: PackageSource[],
  nugetRequestTimeout: number,
  vscodeHttpConfig: any
): Promise<PackageVersion> {
  return getPackageVersions(
    packageName,
    packageSources,
    nugetRequestTimeout,
    vscodeHttpConfig
  );
}

/**
 * Get array of the `package versions`
 * @param packageName The package name
 * @param packageVersionsUrls The nuget server url
 * @param requestOption The request options
 * @param vscodeHttpConfig vscode http config
 * @returns `PackageVersion[]`
 */
export async function fetchPackageVersionsBatch(
  packages: string[],
  packageSources: PackageSource[],
  nugetRequestTimeout: number,
  vscodeHttpConfig: any
): Promise<PackageVersion[]> {
  let result = await Promise.all(
    packages.map(pkgName =>
      getPackageVersions(
        pkgName,
        packageSources,
        nugetRequestTimeout,
        vscodeHttpConfig
      )
    )
  );

  const dirs = packageSources.filter(
    x => x.sourceType.toString() === SourceType[SourceType.local]
  );
  if (packageSources.length > 0) {
    let localPackages: PackageVersion[] = [];

    var searchResult: ServerPackageSearchResult = await localSearchPackage(
      dirs.map(x => x.sourceDirectory),
      null,
      packageSources[0],
      null,
      null
    );
    searchResult?.data?.forEach(pkg => {
      const index = result.findIndex(x => x.packageName == pkg.id);
      if (index === -1) {
        result.push.
      }else{
        const versions: string[] = mergeList([
          ...result[index].versions,
          ...pkg.versions.map(x => x.version),
        ]);
        result[index].versions = sortVersions(versions);
      }
    });
  }

  return result;
}
/**
 * Search for packages
 * @param query query
 * @param searchPackageUrls server address
 * @param preRelease true/false
 * @param take take items
 * @param skip skip items
 * @param vscodeHttpConfig vscode http config
 * @param nugetRequestTimeout request timeout
 * @returns list of packages
 */
export async function searchPackage(
  query: string,
  packageSources: PackageSource[],
  take: number,
  skip: number,
  nugetRequestTimeout: number,
  vscodeHttpConfig: any,
  packageSourceId?: number
): Promise<PackageSearchResult[]> {
  if (packageSourceId != null) {
    packageSources = packageSources.filter(x => x.id == packageSourceId!);
  }

  const results = await Promise.all(
    packageSources.map(async src => {
      if (src.sourceType.toString() === SourceType[SourceType.local]) {
        return await localSearchPackage(
          [src.sourceDirectory],
          query,
          src,
          take,
          skip
        );
      }

      const queryString = jsonToQueryString({
        q: query,
        preRelease: src.preRelease,
        semVerLevel: '2.0.0',
        skip: skip,
        take: take,
      });
      let url = `${src.searchUrl}${queryString}`;
      const requestOption = getRequestOptions(
        src.authorization,
        nugetRequestTimeout,
        vscodeHttpConfig
      );
      return fetch(url, requestOption)
        .then(async response => {
          const rawResult = await response.text();
          let jsonResponse: ServerPackageSearchResult;
          try {
            jsonResponse = JSON.parse(rawResult);
            jsonResponse.packageSourceName = src.sourceName;
            jsonResponse.packageSourceId = src.id;
          } catch (ex) {
            const message = `[NuGet Package Manager GUI => ERROR!!!]${EOL}[Request to url:${url}]${EOL}[timeout:${requestOption.timeout}]${EOL}[proxy is active:${!!requestOption.agent}]${EOL}[result:${rawResult}]${EOL}`;
            showErrorMessage(message);
            throw ex;
          }

          return jsonResponse;
        })
        .catch(error => {
          throw `[An error occurred in the searching package] ${error.message}`;
        });
    })
  );

  return results.map(result => {
    return {
      packageSourceId: result.packageSourceId,
      packageSourceName: result.packageSourceName,
      packages: result.data ?? [],
      totalHits: +result.totalHits,
    };
  });
}

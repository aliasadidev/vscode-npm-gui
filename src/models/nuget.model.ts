/**
 * The package metadata
 * The docs: https://docs.microsoft.com/en-us/nuget/api/search-query-service-resource
 */
export interface PackageMetadata {
  /**
   * The ID of the matched package
   */
  id: string;
  registration: string;
  /**
   * The full SemVer 2.0.0 version string of the package (could contain build metadata)
   */
  version: string;
  description: string;
  summary: string;
  title: string;
  iconUrl: string;
  licenseUrl: string;
  projectUrl: string;
  tags: any[];
  authors: string[];
  totalDownloads: number;
  verified: boolean;
  packageTypes: SearchPackageResultPackageType[];
  versions: SearchPackageResultVersion[];
  /**
   * computed property
   */
  stableVersion?: string;
  /**
   * computed property
   */
  packageWebUrl?: string;
}

/**
 * The package types defined by the package author (added in SearchQueryService/3.5.0)
 */
export interface SearchPackageResultPackageType {
  name: string;
}

/**
 * All of the versions of the package matching the prerelease parameter
 */
export interface SearchPackageResultVersion {
  /**
   * The full SemVer 2.0.0 version string of the package (could contain build metadata)
   */
  version: string;
  /**
   * The number of downloads for this specific package version
   */
  downloads: number;
}

/**
 * The search result model
 */
export interface PackageSearchResult {
  /**
   * The list of packages
   */
  packages: PackageMetadata[];
  /**
   * The number of packages the related to query search
   */
  totalHits: number;
  /**
   * The id of package source
   */
  packageSourceId: number;
  /**
   * The name of package source
   */
  packageSourceName: string;
}

export interface ServerPackageSearchResult {
  /**
   * The list of packages
   */
  data: PackageMetadata[];
  /**
   * The number of packages the related to query search
   */
  totalHits: number;
  /**
   * The id of package source
   */
  packageSourceId: number;
  /**
   * The name of package source
   */
  packageSourceName: string;
}

/**
 * The package versions
 */
export interface PackageVersion {
  /**
   * The package name
   */
  packageName: string;
  /**
   * The package versions
   */
  versions: string[];
  /**
   * The package source name
   */
  sourceName: string;
  /**
   * The Package source id
   */
  sourceId: number;
}

/**
 * The installed package version
 */
export interface PackageDetail {
  /**
   * The package name
   */
  packageName: string;
  /**
   * The package version
   */
  packageVersion: string;
}

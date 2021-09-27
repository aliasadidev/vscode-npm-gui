/**
 * The package metadata
 *
 * The docs: https://docs.microsoft.com/en-us/nuget/api/registration-base-url-resource
 */
export interface PackageMetadata {
  /**
   * The package name
   */
  id: string;
  registration: string;
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
   * computed
   */
  stableVersion?: string;
}
export interface SearchPackageResultPackageType {
  name: string;
}

export interface SearchPackageResultVersion {
  version: string;
  downloads: number;
}


export interface SearchPackageResult {
  data: PackageMetadata[];
  totalHits?: number;
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
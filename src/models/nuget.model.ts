/**
 * The package metadata
 * 
 * The docs: https://docs.microsoft.com/en-us/nuget/api/registration-base-url-resource
 */
export interface SearchPackageResult {
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
}
export interface SearchPackageResultPackageType {
    name: string;
}

export interface SearchPackageResultVersion {
    version: string;
    downloads: number;
}

/**
 * The package versions
 */
export interface PackageVersion {
    /**
     * The package name
     */
    PackageName: string;
    /**
     * The package versions
     */
    Versions: string[];
}

/**
 * The package version
 */
export interface PackageDetail {
    /**
     * The package name
     */
    PackageName: string;
    /**
    * The package version
    */
    PackageVersion: string;
}
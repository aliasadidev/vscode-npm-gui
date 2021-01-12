
export interface Project {
    ID: number;
    ProjectName: string;
    ProjectPath: string;
    Packages: Array<PackageDetail>
}

export interface PackageDetail {
    PackageName: string;
    PackageVersion: string;
    NewerVersion: string;
    IsUpdated: boolean;
    VersionList: Array<string>;
}

export interface PackageVersion {
    PackageName: string;
    Versions: Array<string>;
}
export interface Package {
    PackageName: string;
    PackageVersion: string;
}

// export interface AutocompletePackageResult {
//     data: Array<string>;
//     totalHits: number;
// }

export interface Options {

}



export interface SearchPackageResultPackageType {
    name: string;
}

export interface SearchPackageResultVersion {
    version: string;
    downloads: number;
}

export interface SearchPackageResult {
    registration: string;
    id: string;
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

/**
 * If the validation result wasn't successful, IsSuccessful is equal to `false`.
 */
export interface ValidationResult {
    /**
     * The validation was successful or not
     */
    IsSuccessful: boolean;
    /**
     * The validation error
     */
    ErrorMessage?: string;
    Exception?: any;
}

export class CommandResult {
    IsSuccessful: boolean = false;
    Message?: string;
    Exception?: any;
}



export interface ExtensionConfiguration {
    nugetRequestTimeout: number;
    nugetPackageVersionsUrl: string;
    nugetSearchPackageUrl: string;
    nugetSearchPackagePreRelease: boolean;
    nugetSearchPackageDefaultTake: number;
}

export interface ProxyOption {
    ProxyIsActive: boolean;
    HttpsProxyAgent?: any;
    headers?: any[];
}

export interface RequestOption {
    agent?: any;
    headers: any[];
    timeout: number;
}
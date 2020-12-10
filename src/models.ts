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



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

export interface PackageVersion {
    PackageName: string;
    Versions: string[];
}
export interface Package {
    PackageName: string;
    PackageVersion: string;
}
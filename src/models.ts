export interface Project {
    ID: number;
    ProjectName: string;
    ProjectPath: string;
    Packages: Array<Package>
}

export interface Package {
    PackageName: string;
    PackageVersion: string;
    NewerVersion: string;
    IsUpdated: boolean;
    VersionList: Array<string>;
    Match: any;
}
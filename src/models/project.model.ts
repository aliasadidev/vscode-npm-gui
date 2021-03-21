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











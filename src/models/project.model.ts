/**
 * The project model
 */
export interface Project {
    /**
     * The unique id for each project
     */
    ID: number;
    /**
     * The project name is the same as `[project-name]`.csproj/fsproj
     */
    ProjectName: string;
    /**
     * The project path 
     */
    ProjectPath: string;
    /**
     * The packages in the project
     */
    Packages: PackageDetail[]
}

/**
 * The package detail model
 */
export interface PackageDetail {
    /**
     * The package name
     */
    PackageName: string;
    /**
     * The installed package version
     */
    PackageVersion: string;
    /**
     * The newer version of the package
     */
    NewerVersion: string;
    /**
     * PackageVersion is equal to NewerVersion ?
     */
    IsUpdated: boolean;
    /**
     * All versions of the package
     */
    VersionList: string[];
}











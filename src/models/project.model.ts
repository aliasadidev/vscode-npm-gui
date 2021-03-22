/**
 * The project model
 */
export interface Project {
    /**
     * The unique id for each project
     */
    id: number;
    /**
     * The project name is the same as `[project-name]`.csproj/fsproj
     */
    projectName: string;
    /**
     * The project path 
     */
    projectPath: string;
    /**
     * The packages in the project
     */
    packages: PackageDetail[]
}

/**
 * The package detail model
 */
export interface PackageDetail {
    /**
     * The package name
     */
    packageName: string;
    /**
     * The installed package version
     */
    packageVersion: string;
    /**
     * The newer version of the package
     */
    newerVersion: string;
    /**
     * packageVersion is equal to newerVersion ?
     */
    isUpdated: boolean;
    /**
     * All versions of the package
     */
    versionList: string[];
}











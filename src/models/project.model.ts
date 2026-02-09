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
    packages: PackageDetail[];
    /**
       * Whether this project uses Central Package Management (Directory.Packages.props)
       */
    isCpm: boolean;
    /**
       * Absolute path to the governing Directory.Packages.props file (if CPM is enabled)
       */
    propsFilePath?: string;
    /**
     * Whether this is a virtual project representing unreferenced PackageVersion entries
     * from a Directory.Packages.props file (not a real .csproj/.fsproj)
     */
    isVirtualPropsProject?: boolean;
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
    /**
     * The package source name
     */
    sourceName: string;
    /**
     * The package source id
     */
    sourceId: number | null;
    /**
       * Whether the version is centrally managed via Directory.Packages.props
       */
    isCentrallyManaged: boolean;
    /**
       * Whether the package has a VersionOverride attribute in the project file
       */
    hasVersionOverride: boolean;
}

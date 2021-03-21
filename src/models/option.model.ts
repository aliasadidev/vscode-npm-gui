export interface ExtensionConfiguration {
    nugetRequestTimeout: number;
    nugetPackageVersionsUrls: string[];
    nugetSearchPackageUrls: string[];
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
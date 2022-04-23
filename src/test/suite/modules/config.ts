import path = require('path');
import { AuthorizationType, ExtensionConfiguration, SourceType } from '../../../models/option.model';

export function getConfigOptions(): ExtensionConfiguration {
  const res: ExtensionConfiguration = ({
    indentType: "\t",
    requestTimeout: 90000,
    packageSources: [
      {
        id: 1,
        sourceName: "NuGet",
        preRelease: false,
        authorization: {
          authType: AuthorizationType[AuthorizationType.none],
          password: "",
          username: ""
        },
        packageVersionsUrl: "https://api.nuget.org/v3-flatcontainer/{{packageName}}/index.json",
        searchUrl: "https://azuresearch-usnc.nuget.org/query",
        sourceType: SourceType.server,
        packageUrl: "https://www.nuget.org/packages/{{packageName}}",
      },
    ],
    vscodeHttpConfig: {}
  });
  return res;
}


export function getTestPath(fileName: string): string {
  var testRootPath = path.resolve(__dirname, `../..`);
  return path.resolve(testRootPath, `test-data/${fileName}`);
}
# NuGet Package Manager GUI For VSCode

#### An extension for Visual Studio Code that lets you easily __`update/remove/install`__ packages from NuGet public/private servers for __`.NET Core/.Net 5+`__ projects


  
[![Marketplace](https://vsmarketplacebadge.apphb.com/version-short/aliasadidev.nugetpackagemanagergui.svg)](https://marketplace.visualstudio.com/items?itemName=aliasadidev.nugetpackagemanagergui)
[![Installs](https://vsmarketplacebadge.apphb.com/installs-short/aliasadidev.nugetpackagemanagergui.svg)](https://marketplace.visualstudio.com/items?itemName=aliasadidev.nugetpackagemanagergui)
[![Downloads](https://vsmarketplacebadge.apphb.com/downloads-short/aliasadidev.nugetpackagemanagergui.svg)](https://marketplace.visualstudio.com/items?itemName=aliasadidev.nugetpackagemanagergui)
[![Rating](https://vsmarketplacebadge.apphb.com/rating-short/aliasadidev.nugetpackagemanagergui.svg)](https://marketplace.visualstudio.com/items?itemName=aliasadidev.nugetpackagemanagergui)


## Features

- Simple & Fast
- An easy user interface
- Handles workspaces with multiple `.csproj` or `.fsproj` files
- Update all packages with one click
- Remove a package from the projects
- Search and install new packages from NuGet Server
- Support several NuGet servers (`NuGet`, `BaGet`, `GitLab`, `Nexus`, `Azure`, `JFrog`, `ProGet`)
- Compatible with Linux and Windows
- Indenting XML output
- Support basic authentication for private registries


### How it works
1. Open your project workspace in VSCode
2. Open the Command Palette (Ctrl+Shift+P) 
3. Select **`> NuGet Package Manager GUI`**



![Update a Package](https://raw.githubusercontent.com/aliasadidev/vscode-npm-gui/main/images/demo2-v1.1.7.gif)



## Settings
### You can override the following settings in the **User or Workspace** `settings.json`:
```js
{
//The number of spaces to be used for indenting XML output. Passing characters like ' ' or '\t' are also accepted
"nugetpackagemanagergui.indentType": "2",
//The maximum duration for completing a request from this extension
"nugetpackagemanagergui.requestTimeout": 9000,
// The package sources
// The supported package sources: Azure/GitLab/GitHub/BaGet/Nexus/NuGet
"nugetpackagemanagergui.packageSources": [{
  // The package source name
  "sourceName": "Azure",
  // True or false determining whether to include pre-release packages
  "preRelease": true,
  // The package source authentication settings
  "authorization": {
    // The auth types (basicAuth / none)
    "authType": "basicAuth",
    // It is required if authType is equal to basicAuth
    "username": "ali.asadi",
    // It is required if authType is equal to basicAuth
    "password": "ACCESS_TOKEN_KEY"
  },
  //The NuGet endpoint address for getting package versions
  //* The extension injects {{packageName}} property automatically
  // NuGet  Host  "https://api.nuget.org/v3-flatcontainer/{{packageName}}/index.json"
  // BaGet  Host  "http://localhost/v3/package/{{packageName}}/index.json"
  // GitLab Host  "https://gitlab.com/api/v4/projects/x/packages/nuget/download/{{packageName}}/index.json"
  // Nexus  Host  "http://localhost/repository/nuget-hosted/v3/content/{{packageName}}/index.json"
  // Azure  Host  "https://pkgs.dev.azure.com/username/guid/_packaging/guid/nuget/v3/flat2/{{packageName}}/index.json"
  // ProGet Host: "http://localhost/nuget/Test-Feed/v3/flatcontainer/{{packageName}}/index.json"
  "packageVersionsUrl": "https://api.nuget.org/v3-flatcontainer/{{packageName}}/index.json",
  // The package url in the host server
  // NuGet  Host  "https://www.nuget.org/packages/{{packageName}}"
  // Azure  Host  "https://dev.azure.com/user/project/_artifacts/feed/feed-name/NuGet/{{packageName}}/{{version}}/overview"
  // GitLab Host  "https://gitlab.com/user/project/-/packages?type=&orderBy=name&sort=asc&search[]={{packageName}}"
  // ProGet Host: "http://localhost/feeds/Test-Feed/{{packageName}}/versions"
  "packageUrl": "https://www.nuget.org/packages/{{packageName}}",
  //The NuGet endpoint address for searching packages
  // NuGet  Host "https://azuresearch-usnc.nuget.org/query"
  // BaGet  Host "http://localhost/v3/search"
  // GitLab Host "https://gitlab.com/api/v4/projects/x/packages/nuget/query"
  // Nexus  Host "http://localhost/repository/nuget-hosted/v3/query/0"
  // Azure  Host "https://pkgs.dev.azure.com/username/guid/_packaging/guid/nuget/v3/query2"
  // ProGet Host:"http://localhost/nuget/Test-Feed/v3/search"
  "searchUrl": "https://azuresearch-usnc.nuget.org/query",
  // The source types (server / local)
  // * local type isn't supported.
  "sourceType": "server",
}]
}
```

# What's New

## Version 2.0.3 - July 31, 2022
#### Added
*  Auto detect VSCode theme
*  Perform search when pressing enter in the install package tab

## Version 2.0.2 - Apr 18, 2022
#### Fixed
*  Fixed unordered version list
*  Fixed an issue in ProGet registry `authors` property

## Version 2.0.1 - Mar 13, 2022
#### Changed
*  Update README.md

## Version 2.0.0 - Mar 13, 2022
**⚠ WARNING: This version incompatible with the previous versions** 

#### Added
*  Add support for basic auth to package sources
*  Add the package sources drop-down list into the install package page
*  Add `packageUrl` setting to see the packages in the package source host
#### Changed
*  Improve the speed of load package versions functionality
*  Improve extension `Settings` config
#### Fixed
*  Fixed the proxy problem


## Version 1.1.9 - Oct 4, 2021
#### Fixed
*  Fixed some bugs

## Version 1.1.8 - Sep 28, 2021
#### Fixed
*  Fixed some bugs

## Version 1.1.7 - Sep 27, 2021
#### Added
*  Add pagination to the package search results 
*  Add search box in the project list
*  Add new setting `nugetpackagemanagergui.indentType` for indenting XML output
#### Fixed
*  Fixed some bugs
#### Changed
* Improve UI/UX

#### Deprecated
* ~~nugetpackagemanagergui.nuget.searchPackage.defaultTake~~ is deprecated


## Version 1.1.6 - Jan 30, 2021
#### Added
*  Support several NuGet servers ([#10](https://github.com/aliasadidev/vscode-npm-gui/pull/10) by [@TomyCesaille](https://github.com/TomyCesaille))
#### Changed
* Both ~~`nuget.packageVersionsUrl`~~ and ~~`nuget.searchPackage.url`~~ properties changed to `nuget.packageVersionsUrls` and `nuget.searchPackage.urls`

## Version 1.1.5 - Jan 24, 2021
#### Added
* Log error detail in VSCode Developer Tools
#### Fixed
*  Find projects in all workspace folders ([#8](https://github.com/aliasadidev/vscode-npm-gui/pull/8) by [@m4ss1m0g](https://github.com/m4ss1m0g))

## Version 1.1.4 - Jan 14, 2021
#### Added
* Add the proxy support


## Version 1.1.3 - Jan 08, 2021
#### Changed
* Improve UI/UX

#### Fixed
* Install new package bug fixed

## Version 1.1.2 - Dec 25, 2020
#### Changed
* Improve the speed of loading package versions from NuGet server(**`4x faster than the older versions`**)

### Added
* Some variables overridable in `settings.json`

---
[JetBrains](https://www.jetbrains.com/?from=vscode-npm-gui) kindly provides vscode-npm-gui with a free open-source licence for their Rider.

![image](https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/JetBrains_Logo_2016.svg/121px-JetBrains_Logo_2016.svg.png)

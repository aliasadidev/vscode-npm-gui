# NuGet Package Manager GUI For VSCode

#### An extension for Visual Studio Code that lets you easily __`update/remove/install`__ packages from NuGet server for __`.NET Core/.Net 5`__ projects


  
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
- Support several NuGet servers (`NuGet`, `BaGet`, `GitLab`, `Nexus`)
- Compatible with Linux and Windows
- Indenting XML output


### How it works
1. Open your project workspace in VSCode
2. Open the Command Palette (Ctrl+Shift+P) 
3. Select **`> NuGet Package Manager GUI`**



![Update a Package](https://raw.githubusercontent.com/aliasadidev/vscode-npm-gui/main/images/demo2-v1.1.7.gif)



## Settings
### You can override the following settings in the **User or Workspace** `settings.json`:
```js
{
//The maximum duration for completing a request from this extension
"nugetpackagemanagergui.nuget.requestTimeout": 9000,

//The NuGet endpoint addresses for getting package versions
//* The first address in the list has highest priority
//* The {{packageName}} property injecting by extension
// NuGet Host "https://api.nuget.org/v3-flatcontainer/{{packageName}}/index.json"
// BaGet Host "http://localhost/v3/package/{{packageName}}/index.json"
// GitLab Host "http://localhost/api/v4/projects/2/packages/nuget/download/{{packageName}}/index.json"
// Nexus Host "http://localhost/repository/nuget-hosted/v3/content/{{packageName}}/index.json"
"nugetpackagemanagergui.nuget.packageVersionsUrls": [
    "https://api.nuget.org/v3-flatcontainer/{{packageName}}/index.json"
],

//The NuGet endpoint addresses for searching packages
//* The first address in the list has highest priority
// NuGet Host "https://azuresearch-usnc.nuget.org/query"
// BaGet Host "http://localhost/v3/search"
// GitLab Host "http://localhost/api/v4/projects/2/packages/nuget/query"
// Nexus Host "http://localhost/repository/nuget-hosted/v3/query/0"
"nugetpackagemanagergui.nuget.searchPackage.urls": [
    "https://azuresearch-usnc.nuget.org/query"
],

//true or false determining whether to include pre-release packages in the result of the search
"nugetpackagemanagergui.nuget.searchPackage.preRelease": false,

//deprecated
//The number of packages to return in the search result
"nugetpackagemanagergui.nuget.searchPackage.defaultTake":  10

//The number of spaces to be used for indenting XML output. Passing characters like ' ' or '\t' are also accepted
"nugetpackagemanagergui.indentType":  "2"		
}

```

# What's New

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

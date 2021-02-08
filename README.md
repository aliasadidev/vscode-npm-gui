# Nuget Package Manager GUI For VSCode

#### An extension for Visual Studio Code that lets you easily __`update/remove/install`__ packages from Nuget server for __`.NET Core/.Net 5`__ projects

## Features

- An easy user interface
- Handles workspaces with multiple `.csproj` or `.fsproj` files
- Update all packages with one click
- Remove a package from the projects
- Search and install new packages from Nuget Server
- Support several nuget servers
- Compatible with Linux and Windows


### How it works
1. Open your project workspace in VSCode
2. Open the Command Palette (Ctrl+Shift+P) 
3. Select **`> Nuget Package Manager GUI`**



![Update a Package](https://raw.githubusercontent.com/aliasadidev/vsocde-npm-gui/main/images/demo1.gif?v3)



## Settings
### You can override the following settings in the **User or Workspace** `settings.json`:
```js
{
//The maximum duration for completing a request from this extension
"nugetpackagemanagergui.nuget.requestTimeout": 9000,

//The Nuget endpoint addresses for getting package versions
//* The first address in the list has highest priority
//* The {{packageName}} property inject by extension
"nugetpackagemanagergui.nuget.packageVersionsUrls": [
    "https://api.nuget.org/v3-flatcontainer/{{packageName}}/index.json"
],

//The Nuget endpoint addresses for searching packages
//* The first address in the list has highest priority
"nugetpackagemanagergui.nuget.searchPackage.urls": [
    "https://azuresearch-usnc.nuget.org/query"
],

//true or false determining whether to include pre-release packages in the result of the search
"nugetpackagemanagergui.nuget.searchPackage.preRelease": false,

//The number of packages to return in the search result
"nugetpackagemanagergui.nuget.searchPackage.defaultTake":  10		
}

```

# What's New


## Version 1.1.6 - Jan 30, 2021
#### Added
*  Support several nuget servers ([#10](https://github.com/aliasadidev/vsocde-npm-gui/pull/10) by [@TomyCesaille](https://github.com/TomyCesaille))
#### Changed
* Both ~~`nuget.packageVersionsUrl`~~ and ~~`nuget.searchPackage.url`~~ properties changed to `nuget.packageVersionsUrls` and `nuget.searchPackage.urls`

## Version 1.1.5 - Jan 24, 2021
#### Added
* Log error detail in VSCode Developer Tools
#### Fixed
*  Find projects in all workspace folders ([#8](https://github.com/aliasadidev/vsocde-npm-gui/pull/8) by [@m4ss1m0g](https://github.com/m4ss1m0g))

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
* Improve the speed of loading package versions from Nuget server(**`4x faster than the older versions`**)

### Added
* Some variables overridable in `settings.json`

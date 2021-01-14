# Nuget Package Manager GUI For VSCode

#### An extension for Visual Studio Code that lets you easily __`update/remove/install`__ packages from Nuget server for __`.NET Core/.Net 5`__ projects

## Features

- An easy user interface
- Handles workspaces with multiple `.csproj` or `.fsproj` files
- Update all packages with one click
- Remove a package from the projects
- Search and install new packages from Nuget Server


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

//The Nuget endpoint address for getting package versions
"nugetpackagemanagergui.nuget.packageVersionsUrl": "https://api.nuget.org/v3-flatcontainer",    

//The Nuget endpoint address for searching packages
"nugetpackagemanagergui.nuget.searchPackage.url": "https://azuresearch-usnc.nuget.org/query",

//true or false determining whether to include pre-release packages in the result of the search
"nugetpackagemanagergui.nuget.searchPackage.preRelease": false,

//The number of packages to return in the search result
"nugetpackagemanagergui.nuget.searchPackage.defaultTake":  10		
}

```

# What's New


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
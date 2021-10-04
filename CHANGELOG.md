# Change Log

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

## Version 1.1.1 - Dec 12, 2020
#### Changed
* Update `Command Title` from ~~`NuGet Package Manager GUI: Update Packages`~~ to **`NuGet Package Manager GUI`**
* Update `Changelog` file

## Version 1.1.0 - Dec 11, 2020
#### Added
* Add `update all packages` feature
#### Change
* Change the notification type from `ShowInformationMessage` to `SetStatusBarMessage`
#### Fixed
* Fixed a bug in the update project file

## Version 1.0.3 - Dec 11, 2020
#### Fixed
* Fixed a bug in the update project file

## Version 1.0.2 - Dec 11, 2020
#### Fixed
* Fixed a bug in the get root path of workspace

## Version 1.0.1 -  Dec 11, 2020
### Changed
* Change demo.gif

## Version 1.0.0 -  Dec 10, 2020
#### Added
* Add `search form` feature for install the new packages from NuGet server
* Add `remove` & `remove all` functionality to the project table
#### Changed
* Change ui completely
* Change method of the update project from `regex` to `xml`
* Change demo.gif file

## Version 0.0.5 - Dec 4, 2020
#### Added
* Add `update a package` feature
* Add `update a package in all projects` feature
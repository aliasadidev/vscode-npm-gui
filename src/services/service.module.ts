import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { hasFileAccess, readFile, writeToFile } from "../modules/file.module";
import { ExtensionConfiguration } from '../models/option.model';
import { PackageDetail, Project } from '../models/project.model';
import { SearchPackageResult, PackageVersion, Package } from '../models/nuget.model';
import { CommandResult } from '../models/common.model';
import { fetchPackageVersions, fetchPackageVersionsBatch, searchPackage } from "../modules/nuget.module";
import { addPackage, getPackages, removePackage, updatePackage } from "../modules/xml.module";
import { mergeList } from "../modules/utils";
import glob = require('glob');


export class packageManagerService {

    // private readonly config: ExtensionConfiguration;


    // constructor(config: ExtensionConfiguration) {
    //     this.config = config;
    // }








    //get(): Array<Project> { return this.projectList };
























}
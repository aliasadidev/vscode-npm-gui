import { PackageDetail, Project } from "../models/project.model";
import { ServiceResult } from "../models/common.model";
import { hasFileAccess } from "../modules/file.module";
import * as fs from 'fs';

/**
 * Get a project from the projects list
 * @param projectList List of projects
 * @param projectID Project ID
 * @returns {Project}
 */
export function getProject(projectList: Project[], projectID: number): Project {
  let project = projectList.find(d => d.id === projectID);
  if (project === undefined) {
    throw "The project file does not exists";
  }
  return project;
}

/**
 * Get a package from the project
 * @param project The target project
 * @param packageName The package name for searching
 * @returns {PackageDetail}
 */
export function getPackage(project: Project, packageName: string): PackageDetail {
  let pkgIndex = getPackageIndex(project, packageName);
  return project.packages[pkgIndex];
}
/**
 * Get the package index from the project
 * @param project The target project
 * @param packageName The package name for finding the index
 * @returns return the index of package
 */
export function getPackageIndex(project: Project, packageName: string): number {
  let pkgIndex = project.packages.findIndex(e => e.packageName === packageName);
  if (pkgIndex === -1) {
    throw `The selected package does not exists in '${project.projectName}' project`;
  }
  return pkgIndex;
}

/**
 * Check the file access
 * @param project The target project
 * @param mode Check a file for read-write access
 * @returns {ServiceResult}
 */
export function checkAccess(project: Project, mode: number = fs.constants.O_RDWR): ServiceResult {
  let commandResult: ServiceResult;
  let hasAccess = hasFileAccess(project.projectPath, mode);
  if (hasAccess.isSuccessful) {
    commandResult = { isSuccessful: true };
  } else {
    commandResult = {
      message: hasAccess.errorMessage,
      isSuccessful: false,
      exception: hasAccess.exception
    };
  }
  return commandResult;
}
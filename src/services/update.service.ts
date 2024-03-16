import { Project } from '../models/project.model';
import { ServiceResult } from '../models/common.model';
import { readFileContent, writeToFile } from '../modules/file.module';
import { updatePackage } from '../modules/xml.module';
import { checkAccess, getPackage, getProject } from './common.service';
import { ExtensionConfiguration } from '../models/option.model';
import { isUpdate } from './version.service';

export function update(
  projectList: Project[],
  projectID: number,
  packageName: string,
  selectedVersion: string,
  config: ExtensionConfiguration
): ServiceResult {
  const project = getProject(projectList, projectID);
  const pkg = getPackage(project, packageName);

  let commandResult = checkAccess(project);
  if (commandResult.isSuccessful) {
    pkg.isUpdated = isUpdate(selectedVersion, pkg.newerVersion);

    updatePackageInProjectFile(
      project.projectPath,
      pkg.packageName,
      selectedVersion,
      config
    );

    pkg.packageVersion = selectedVersion;

    commandResult = {
      message: `${pkg.packageName} updated in ${project.projectName}`,
      isSuccessful: true,
    };
  }

  return commandResult;
}

export function updateAllPackage(
  projectList: Project[],
  packageName: string,
  selectedVersion: string,
  config: ExtensionConfiguration
): ServiceResult[] {
  let commandResultList: ServiceResult[] = [];

  projectList.forEach(project => {
    let pkgIndex = project.packages.findIndex(
      e => e.packageName === packageName
    );
    if (pkgIndex !== -1) {
      let commandResult = update(
        projectList,
        project.id,
        packageName,
        selectedVersion,
        config
      );
      if (commandResult.isSuccessful) {
        commandResultList.push({
          isSuccessful: true,
          message: `${project.projectName}|${packageName}`,
        });
      } else {
        commandResultList.push(commandResult);
      }
    }
  });
  return commandResultList;
}

export function updateAllProjects(
  projectList: Project[],
  config: ExtensionConfiguration
): ServiceResult[] {
  let commandResultList: ServiceResult[] = [];

  projectList.forEach(project => {
    const packages = project.packages.filter(x => x.isUpdated == false);
    packages.forEach(pkg => {
      let commandResult = update(
        projectList,
        project.id,
        pkg.packageName,
        pkg.newerVersion,
        config
      );
      if (commandResult.isSuccessful) {
        commandResultList.push({
          isSuccessful: true,
          message: `${project.projectName}|${pkg.packageName}`,
        });
      } else {
        commandResultList.push(commandResult);
      }
    });
  });

  return commandResultList;
}

function updatePackageInProjectFile(
  projectPath: string,
  packageName: string,
  selectedVersion: string,
  config: ExtensionConfiguration
) {
  const projectFileContent = readFileContent(projectPath);
  const xmlContent: string = updatePackage(
    projectFileContent,
    packageName,
    selectedVersion
  );
  writeToFile(projectPath, xmlContent);
}

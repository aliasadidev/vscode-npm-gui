import { Project } from '../models/project.model';
import { ServiceResult } from '../models/common.model';
import { readFileContent, writeToFile } from '../modules/file.module';
import { removePackage } from '../modules/xml.module';
import { checkAccess, getPackageIndex, getProject } from './common.service';
import { ExtensionConfiguration } from '../models/option.model';

export function remove(
  projectList: Project[],
  projectID: number,
  packageName: string,
  config: ExtensionConfiguration
): ServiceResult {
  const project = getProject(projectList, projectID);
  const pkgIndex = getPackageIndex(project, packageName);

  let commandResult = checkAccess(project);
  if (commandResult.isSuccessful) {
    const projectFileContent = readFileContent(project.projectPath);
    const xmlContent: string = removePackage(
      projectFileContent,
      packageName,
      project
    );
    writeToFile(project.projectPath, xmlContent);

    project.packages.splice(pkgIndex, 1);

    commandResult = {
      message: `${packageName} removed from ${project.projectName}`,
      isSuccessful: true,
    };
  }

  return commandResult;
}

export function removeAllPackage(
  projectList: Project[],
  packageName: string,
  config: ExtensionConfiguration
) {
  let commandResultList: ServiceResult[] = [];

  projectList.forEach(project => {
    const packages = project.packages.filter(x => x.packageName == packageName);
    packages.forEach(pkg => {
      let commandResult = remove(
        projectList,
        project.id,
        pkg.packageName,
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

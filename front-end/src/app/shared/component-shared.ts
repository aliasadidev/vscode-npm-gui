import { PackageSource } from '../../../../src/models/option.model';

export function getPackageSourceWebUrl(
  packageSource: PackageSource,
  packageName: string,
  version: string,
  extraUrl: string[]
) {
  if (packageSource?.packageUrl) {
    return packageSource?.packageUrl
      .replace('{{packageName}}', packageName)
      .replace('{{version}}', version);
  } else {
    return extraUrl.find(x => x) ?? '#';
  }
}

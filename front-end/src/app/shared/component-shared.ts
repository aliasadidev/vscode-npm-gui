import { PackageSource } from '../../../../src/models/option.model';

export function getPackageSourceWebUrl(packageSources: PackageSource[], packageSourceId: number | null, packageName: string) {
  let src = packageSources.find(x => x.id == packageSourceId);
  if (!(src && src?.packageUrl)) {
    console.log("packageUrl is empty!", packageSources, packageSourceId, packageName);
    return "#";
  } else
    return src?.packageUrl.replace("{{packageName}}", packageName);
}
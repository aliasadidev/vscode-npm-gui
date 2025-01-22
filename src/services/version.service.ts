import { SearchPackageResultVersion } from '../models/nuget.model';

/**
 * Find the latest stable version of a NuGet package
 * @param versions The list of the package versions
 * @returns {string} If the version wasn't found the result is `Unknown`
 */
export function findStableVersion(versions: string[]): string {
  const regExp: RegExp = /^\d+\.\d+\.\d+(\.\d+)?$/;
  let version: string | undefined = versions
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .slice()
    .reverse()
    .find(x => regExp.test(x));

  if (version === undefined && versions && versions.length > 0) {
    version = versions[versions.length - 1];
  }

  return version ?? 'Unknown';
}

/**
 * Determines whether an update is available based on the provided install version and the last version.
 * @param installVersion The version currently installed.
 * @param lastVersion The latest version available.
 * @returns A boolean value indicating whether an update is available.
 */
export function isUpdate(installVersion: string, lastVersion: string): boolean {
  const extracted = getPattern(installVersion);
  if (extracted) {
    return lastVersion.startsWith(extracted);
  }
  return installVersion == lastVersion;
}

export function getPattern(installVersion: string): string | null {
  const regex = /^(\d+\.(?:\d+\.){0,2})\*$/;
  const match = installVersion.match(regex);
  if (match) {
    const extracted = match[1];
    return extracted;
  }
  return null;
}

export function mergeVersionPatterns(versions: string[]): string[] {
  let lst: string[] = [];
  for (let i = 0; i < versions.length; i++) {
    const str = versions[i];
    lst.push(str);
    var pats = generateVersionPatterns(str);
    pats.forEach(res => {
      if (lst.indexOf(res) == -1) {
        lst.push(res);
      }
    });
  }
  return lst;
}

export function mergeVersionPatternsWithSearch(
  versions: SearchPackageResultVersion[]
): SearchPackageResultVersion[] {
  let lst: SearchPackageResultVersion[] = [];
  for (let i = 0; i < versions.length; i++) {
    const str = versions[i];
    lst.push(str);
    var pats = generateVersionPatterns(str.version);
    pats.forEach(res => {
      if (lst.findIndex(x => x.version == res) == -1) {
        lst.push({ version: res, downloads: 0 }); // TODO: fill download correctly
      }
    });
  }
  return lst;
}

export function generateVersionPatterns(version: string): string[] {
  const regex = /^(\d+)\.(\d+)\.(.*)$/;
  let lst = [];

  const rep1 = version.replace(regex, `$1.*`);
  if (rep1) {
    lst.push(rep1);
  }
  const rep2 = version.replace(regex, `$1.$2.*`);
  if (rep2) {
    lst.push(rep2);
  }

  return lst;
}

function versionToSortable(version: string) {
  const components = version.split('.');
  const numericComponents = components.map(component => {
    const numericPart = parseInt(component, 10);
    return isNaN(numericPart) ? component : numericPart;
  });
  return numericComponents;
}

export function sortVersions(versions: string[]): string[] {
  versions.sort((a, b) => {
    const versionA = versionToSortable(a);
    const versionB = versionToSortable(b);

    for (let i = 0; i < Math.min(versionA.length, versionB.length); i++) {
      if (versionA[i] < versionB[i]) {
        return -1;
      } else if (versionA[i] > versionB[i]) {
        return 1;
      }
    }

    return versionA.length - versionB.length;
  });
  return versions;
}

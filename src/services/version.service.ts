/**
  * Find the latest stable version of a NuGet package
  * @param versions The list of the package versions
  * @returns {string} If the version wasn't found the result is `Unknown`
  */
export function findStableVersion(versions: string[]): string {
  const regExp: RegExp = /^\d+\.\d+\.\d+(\.\d+)?$/m;
  let version: string | undefined = versions.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .slice()
    .reverse()
    .find(x => regExp.test(x));

  if (version === undefined && versions && versions.length > 0) {
    version = versions[versions.length - 1];
  }

  return version ?? "Unknown";
}
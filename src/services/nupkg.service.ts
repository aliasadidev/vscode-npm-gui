import glob = require('glob');

export function findNugetPackageFiles(dirs: string[]): string[] {
  let result: string[] = [];

  dirs.forEach(dir => {
    let files = glob.sync(`${dir}/**/*.nupkg`, {
      ignore: [],
    });

    files.forEach(file => {
      if (result.indexOf(file) === -1) {
        result.push(file);
      }
    });
  });

  return result;
}

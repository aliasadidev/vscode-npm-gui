export class Helper {
  public copyOptions(options: any) {
    var key,
      copy: any = {};
    for (key in options) {
      if (options.hasOwnProperty(key)) {
        copy[key] = options[key];
      }
    }
    return copy;
  }

  public ensureFlagExists(item: string, options: any) {
    if (!(item in options) || typeof options[item] !== 'boolean') {
      options[item] = false;
    }
  }

  public ensureSpacesExists(options: any) {
    if (
      !('spaces' in options) ||
      (typeof options.spaces !== 'number' && typeof options.spaces !== 'string')
    ) {
      options.spaces = 0;
    }
  }

  public ensureAlwaysArrayExists(options: any) {
    if (
      !('alwaysArray' in options) ||
      (typeof options.alwaysArray !== 'boolean' &&
        !this.isArray(options.alwaysArray))
    ) {
      options.alwaysArray = false;
    }
  }

  public ensureKeyExists(key: string, options: any) {
    if (!(key + 'Key' in options) || typeof options[key + 'Key'] !== 'string') {
      options[key + 'Key'] = options.compact ? '_' + key : key;
    }
  }

  public checkFnExists(key: string, options: any) {
    return key + 'Fn' in options;
  }

  public isArray(value: any) {
    if (Array.isArray) {
      return Array.isArray(value);
    }
    return Object.prototype.toString.call(value) === '[object Array]';
  }
}

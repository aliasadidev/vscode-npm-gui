
export const EOL: string = '\n';

/**
 * Convert Json to QueryString
 * @param json The Json data
 * @returns query string with `?` character at the first position of the result
 */
export function jsonToQueryString(json: any) {
  return '?' +
    Object.keys(json).map(function (key) {
      return encodeURIComponent(key) + '=' +
        encodeURIComponent(json[key]);
    }).join('&');
}

/**
 * Distinct a list
 * @param arr The list
 * @returns  Remove the duplicate items from the list
 */
export function mergeList(arr: any) {
  return [...new Set([].concat(...arr))];
}

/**
 * Distinct a list
 * @param arr The list
 * @param key The property name in the object list
 * @returns Remove the duplicate items from the list
 */
export function uniqBy(arr: any[], key: string) {
  let seen = new Set();

  return arr.filter(it => {
    let val = it[key];
    if (seen.has(val)) {
      return false;
    } else {
      seen.add(val);
      return true;
    }
  });
}



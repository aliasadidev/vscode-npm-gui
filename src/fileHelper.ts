import * as fs from 'fs';
import { ValidationResult } from './models/wrapper.model';


/**
 * Reads content of a file
 * @param filePath  The file path
 * @returns {string} The file content
 */
export function readFile(filePath: string): string {
    let fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent;
}
/**
 * Writes the new content to a file
 * @param filePath The file path
 * @param content The new content
 */
export function writeToFile(filePath: string, content: string): void {
    fs.writeFileSync(filePath, content);
}

/**
 * Checks whether a file exists
 * @param filePath The file path
 * @returns {ValidationResult} 
 */
export function checkFileExists(filePath: string): ValidationResult {
    let isExists: boolean = fs.existsSync(filePath);
    return { IsSuccessful: isExists, ErrorMessage: `File "${filePath}" does not exists` };
}
/**
 * Checks access mode of a file 
 * @param filePath The file path
 * @param accessMode The access mode (e.g. fs.constants.R_OK | fs.constants.W_OK)
 * @returns {ValidationResult}
 */
export function checkFileAccess(filePath: string, accessMode: number): ValidationResult {
    let hasAccess: boolean = false, message: any, exception: any;
    try {
        fs.accessSync(filePath, accessMode);
        hasAccess = true;
    }
    catch (ex) {
        exception = ex;
        message = `Access to the file is denied: This extension hasn't the read/write access to the project file ${filePath}`;
    }
    return { IsSuccessful: hasAccess, ErrorMessage: message, Exception: exception };
}
/**
 * Checks whether a file exists, or has the right access
 * @param filePath The file path
 * @param accessMode The access mode of a file (e.g. fs.constants.R_OK | fs.constants.W_OK)
 * @returns {ValidationResult}
 */
export function hasFileAccess(filePath: string, accessMode: number): ValidationResult {
    let result: ValidationResult = { IsSuccessful: true };
    const isExists = checkFileExists(filePath);

    if (isExists.IsSuccessful) {
        let hasAccess = checkFileAccess(filePath, accessMode);
        if (!hasAccess.IsSuccessful)
            result = { ErrorMessage: hasAccess.ErrorMessage, IsSuccessful: false, Exception: hasAccess.Exception };
    } else
        result = { ErrorMessage: isExists.ErrorMessage, IsSuccessful: false, Exception: isExists.Exception };

    return result;
}


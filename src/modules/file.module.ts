import * as fs from 'fs';
import { ValidationResult } from '../models/common.model';


/**
 * Reads content of a file
 * @param filePath  The file path
 * @returns The file content
 */
export function readFileContent(filePath: string): string {
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
 */
export function checkFileExists(filePath: string): ValidationResult {
    let isExists: boolean = fs.existsSync(filePath);
    return { isSuccessful: isExists, errorMessage: (isExists ? undefined : `File "${filePath}" does not exists`) };
}
/**
 * Checks access mode of a file 
 * @param filePath The file path
 * @param accessMode The access mode (e.g. fs.constants.R_OK | fs.constants.W_OK)
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
    return { isSuccessful: hasAccess, errorMessage: message, exception: exception };
}
/**
 * Checks whether a file exists, or has the right access
 * @param filePath The file path
 * @param accessMode The access mode of a file (e.g. fs.constants.R_OK | fs.constants.W_OK)
 */
export function hasFileAccess(filePath: string, accessMode: number): ValidationResult {
    let result: ValidationResult = { isSuccessful: true };
    const isExists = checkFileExists(filePath);

    if (isExists.isSuccessful) {
        let hasAccess = checkFileAccess(filePath, accessMode);
        if (!hasAccess.isSuccessful)
            result = { errorMessage: hasAccess.errorMessage, isSuccessful: false, exception: hasAccess.exception };
    } else
        result = { errorMessage: isExists.errorMessage, isSuccessful: false, exception: isExists.exception };

    return result;
}


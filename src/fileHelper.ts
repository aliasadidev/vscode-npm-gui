import * as fs from 'fs';
import { showErrorMessage } from './vscodeNotify';

export function checkFileExists(filepath: string): void {
    try {
        fs.accessSync(filepath, fs.constants.F_OK);
    } catch (e) {
        console.error(e);
        showErrorMessage(e);
        throw e;
    }
}

export function writeToFile(filePath: string, content: string) {
    checkFileExists(filePath);
    try {
        fs.writeFileSync(filePath, content);
    } catch (err) {
        console.error(err);
        showErrorMessage(err);
        throw err;
    }
}

export function readFile(filePath: string): string {
    checkFileExists(filePath);
    var fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent;
}
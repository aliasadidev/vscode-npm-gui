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
    fs.writeFile(filePath, content, function (err) {
        if (err) {
            console.error(err);
            showErrorMessage(err);
            throw err;
        } else {
            console.log(`${filePath} Updated!`);
        }
    });
}

export function readFile(filePath: string): string {
    checkFileExists(filePath);
    var fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent;
}
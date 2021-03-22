import * as vscode from 'vscode';
import { ServiceResult } from '../models/common.model';

export function setStatusBarMessage(message: string | undefined, hideAfterTimeout?: number) {
    if (message)
        if (hideAfterTimeout)
            vscode.window.setStatusBarMessage(message, hideAfterTimeout)
        else
            vscode.window.setStatusBarMessage(message)
}

export function resetStatusBarMessage() {
    vscode.window.setStatusBarMessage('');
}

export function showInformationMessage(message: string) {
    vscode.window.showInformationMessage(message);
}

export function showErrorMessage(message: any) {
    vscode.window.showErrorMessage(message);
}

export function showCommandResult(commandResult: ServiceResult, successMessage: string | undefined = undefined) {
    resetStatusBarMessage();
    if (commandResult.isSuccessful && (successMessage || commandResult.message)) {
        setStatusBarMessage(successMessage ? successMessage : commandResult.message, 5000);
    } else {
        if (commandResult.message)
            setStatusBarMessage(commandResult.message, 5000);
        showErrorMessage(commandResult.exception)
    }
}

export function showCommandResults(commandResults: ServiceResult[], successMessage: string | undefined = undefined) {
    commandResults.forEach(x => {
        showCommandResult(x, successMessage);
    });
}
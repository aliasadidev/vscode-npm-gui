import * as vscode from 'vscode';

export function setStatusBarMessage(message: string, hideAfterTimeout?: number) {
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
import * as vscode from 'vscode';
import { ServiceResult } from '../models/common.model';

/**
 * Set status bar in VSCode
 * @param message The message for showing in the status bar
 * @param hideAfterTimeout Timeout in milliseconds after which the message will be disposed
 */
export function setStatusBarMessage(
  message: string | undefined,
  hideAfterTimeout?: number
) {
  if (message) {
    if (hideAfterTimeout) {
      vscode.window.setStatusBarMessage(message, hideAfterTimeout);
    } else {
      vscode.window.setStatusBarMessage(message);
    }
  }
}

/**
 * Clear the status bar
 */
export function resetStatusBarMessage() {
  vscode.window.setStatusBarMessage('');
}

/**
 * Show info message
 * @param message The message for showing in the message box (with default box)
 */
export function showInformationMessage(message: string) {
  vscode.window.showInformationMessage(message);
}

/**
 * Show error message
 * @param message The message for showing in the message box (with red box)
 */
export function showErrorMessage(message: any) {
  vscode.window.showErrorMessage(message);
}

/**
 * Single result
 * @param serviceResult The result of a service (e.g install/remove...)
 * @param successMessage Show success message
 */
export function showCommandResult(
  serviceResult: ServiceResult,
  successMessage: string | undefined = undefined
) {
  resetStatusBarMessage();
  if (serviceResult.isSuccessful && (successMessage || serviceResult.message)) {
    setStatusBarMessage(
      successMessage ? successMessage : serviceResult.message,
      5000
    );
  } else {
    if (serviceResult.message) {
      setStatusBarMessage(serviceResult.message, 5000);
    }
    showErrorMessage(serviceResult.exception);
  }
}

/**
 * Use for array
 * @param serviceResults The results of a service (e.g install/remove...)
 * @param successMessage Show success message
 */
export function showCommandResults(
  commandResults: ServiceResult[],
  successMessage: string | undefined = undefined
) {
  commandResults.forEach(x => {
    showCommandResult(x, successMessage);
  });
}

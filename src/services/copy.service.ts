import * as vscode from 'vscode';
import { ServiceResult } from '../models/common.model';

/**
 * Copy the package reference to the clipboard
 * @param packageName The package name
 * @param selectedVersion The target version
 * @returns
 */
export async function copy(
  packageName: string,
  selectedVersion: string
): Promise<ServiceResult> {

  const packageReference = `#r "nuget:${packageName}, ${selectedVersion}"`;

  await vscode.env.clipboard.writeText(packageReference);

  return {
    isSuccessful: true,
    message: `The package '${packageName}' has been copied to the clipboard.`,
  };

}
import { Project } from './project.model';

/**
 * If the validation result was successfully, `isSuccessful` is equal to `true`
 */
export interface ValidationResult {
  /**
   * The validation result
   */
  isSuccessful: boolean;
  /**
   * The validation error
   */
  errorMessage?: string;
  /**
   * The system exception
   */
  exception?: any;
}

/**
 * The service execution result
 */
export interface ServiceResult {
  /**
   * The service result
   */
  isSuccessful: boolean;
  /**
   * The service message
   */
  message?: string;
  /**
   * The system exception
   */
  exception?: any;
}

/**
 * The search result from the workspaces
 */
export interface FindProjectResult extends ServiceResult {
  /**
   * The list of projects
   */
  projectList: Project[];
}

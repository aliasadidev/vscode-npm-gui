import { Project } from "./project.model";

/**
 * If the validation result was successful, IsSuccessful is equal to `true`.
 */
export interface ValidationResult {
    /**
     * The validation result
     */
    IsSuccessful: boolean;
    /**
     * The validation error
     */
    ErrorMessage?: string;
    /**
     * The system exception
     */
    Exception?: any;
}

/**
 * The service execution result
 */
export interface ServiceResult {
    /**
    * The service result
    */
    IsSuccessful: boolean;
    /**
     * The service message
     */
    Message?: string;
    /**
     * The system exception
     */
    Exception?: any;
}

/**
 * The search result from the workspaces
 */
export interface FindProjectResult extends ServiceResult {
    /**
     * The list of projects
     */
    PorjectList: Project[];
}

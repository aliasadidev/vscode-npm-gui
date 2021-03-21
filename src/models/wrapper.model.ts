/**
 * If the validation result wasn't successful, IsSuccessful is equal to `false`.
 */
export interface ValidationResult {
    /**
     * The validation was successful or not
     */
    IsSuccessful: boolean;
    /**
     * The validation error
     */
    ErrorMessage?: string;
    Exception?: any;
}

export class CommandResult {
    IsSuccessful: boolean = false;
    Message?: string;
    Exception?: any;
}


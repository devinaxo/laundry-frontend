// translations until I figure out what to do
export const errorTranslations: Record<string, string> = {
    // Required field
    'The name field is required.': 'El nombre es requerido.',
    'The username field is required.': 'El nombre de usuario es requerido.',
    'The email field is required.': 'El correo electrónico es requerido.',
    'The password field is required.': 'La contraseña es requerida.',
    'The role id field is required.': 'El rol es requerido.',

    // Unique field
    'The username has already been taken.': 'El nombre de usuario ya está en uso.',
    'The email has already been taken.': 'El correo electrónico ya está en uso.',

    // Format validation
    'The email must be a valid email address.': 'El correo electrónico debe ser una dirección válida.',
    'The email field must be a valid email.': 'El correo electrónico debe ser una dirección válida.',

    // Length validation
    'The password must be at least 6 characters.': 'La contraseña debe tener al menos 6 caracteres.',
    'The password may not be greater than 32 characters.': 'La contraseña no debe exceder los 32 caracteres.',
    'The name may not be greater than 255 characters.': 'El nombre no debe exceder los 255 caracteres.',
    'The username may not be greater than 255 characters.': 'El nombre de usuario no debe exceder los 255 caracteres.',

    // Existence validation
    'The selected role id is invalid.': 'El rol seleccionado no es válido.',

    // General
    'Validation failed': 'Error de validación',
    'The given data was invalid.': 'Los datos proporcionados son inválidos.',
    'Server Error': 'Error del servidor',
    'Unauthorized': 'No autorizado',
    'Forbidden': 'Prohibido',
    'Not Found': 'No encontrado',

    // Authentication
    'These credentials do not match our records.': 'Las credenciales no coinciden con nuestros registros.',
    'The provided credentials are incorrect.': 'Las credenciales proporcionadas son incorrectas.',
    'Your account has been disabled.': 'Tu cuenta ha sido deshabilitada.',
};

/**
 * Translates a Laravel error message from English to Spanish
 * @param error - The error message in English
 * @returns The translated error message in Spanish, or the original if no translation is found
 */
export const translateError = (error: string): string => {
    return errorTranslations[error] || error;
};

/**
 * Translates Laravel validation errors object
 * @param errors - Object with field names as keys and error arrays as values
 * @returns Object with translated error messages
 */
export const translateValidationErrors = (errors: Record<string, string[]>): Record<string, string> => {
    const translatedErrors: Record<string, string> = {};

    Object.keys(errors).forEach(field => {
        const firstError = errors[field][0];
        translatedErrors[field] = translateError(firstError);
    });

    return translatedErrors;
};
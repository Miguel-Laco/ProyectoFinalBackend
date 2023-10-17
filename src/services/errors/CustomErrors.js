/* CustomErrors.js */
export default class CustomError {
    static createError({ name = "Error", cause, message, code = 1 }) {
        const error = new Error(message);
        error.stack = '';
        error.cause = cause;
        error.name = name;
        error.code = code;
        console.error(error);  
        throw error; 
    }
}
//ApiError = my own customized version of Error, 
// mainly used to attach an HTTP status code and consistent error information.
class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode= statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if (stack){
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.
                constructor)
        }
    }
}
export {ApiError}
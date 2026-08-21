//A higher-order function is a function that takes another function as an argument OR returns a function.
const asyncHandler = (requestHandler) => {
    return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).
        catch((err) => next(err))
    }
}


export {asyncHandler} 
                        //asyncHandler is a high order function which can be treated as a parameter and as variable too.

// const asyncHandler = (fn) => async (req, res, next) => {
//     try{
//         await fn(req, res, next)
//     } catch(error) {
//         res.status(err.code || 400).json({
//             success: false,
//             message: err.message
//         })
//     }
// }
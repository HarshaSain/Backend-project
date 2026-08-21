import {asyncHandler} from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    //validation like format of email is correct or not
    //check if user exist or not For that we will use username, email unique
    //check for image , check for avatar
    //upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and token from response
    //chek fro user creation
    //return res
    
})

export {registerUser}
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";  

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
    

    const {fullName, email, username, password} = req.body
    console.log("email:", email);

    // if (fullName === ""){
    //     throw new ApiError(400, "fullName is required")
    // }
    if (
        [fullName, email, username, password].some((field) =>
        field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or: [ {username} , {email} ]
    })
    if (existedUser){
        throw new ApiError(409, "User already exists")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
    }
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const checkedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!checkedUser) {
        throw new ApiError(500, "Something when wrong with user registration")
    }

    return res.status(201).json(
        new ApiResponse(200, checkedUser, "User registered")
    )
})

export {registerUser}
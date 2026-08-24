import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";  

const generateAccessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

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

    const existedUser = await User.findOne({
        $or: [ {username} , {email} ]
    })
    if (existedUser){
        throw new ApiError(409, "User already exists")
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

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

const loginUser = asyncHandler(async(req,res) => {
    const {email, username, password} = req.body

    if (!(username || email)){
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
//User this capital with this we can use the methods like findOne/ updateone are of mongoose methods
//user is our generated one with which we can use our own made methods not the above ones
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials ")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,      //means now only server con modify cookie rest can se but can't modify
        secure: true
    }
    return res
    .status(200)
    .cookie("acessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,{
                user: loggedInUser, accessToken,
                refreshToken
            },
            "User logged in Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res) => { 
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))

})

const refreshAccessToken = asyncHandler(async(req,res) => {
    const incomingResfreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingResfreshToken) {
        throw new ApiError (401, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingResfreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError (401, "Invalid refresh token")
        }
        if(incomingResfreshToken !== user?.refreshToken){
            throw new ApiError(401, "Invalid refresh token or expired")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken : newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}
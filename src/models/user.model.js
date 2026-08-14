import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";        //JWT is like a key used for security jiske bhi pass key hogi info mil jayagi
import bcrypt from "bcrypt";          // helps to hass the password

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,    //index: true = "MongoDB, make searching this field faster."
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,  
        },
        fullname: {
            type: String,
            required: true,
            index: true,
            trim: true,  
        },
        avtar: {
            type: String,    //cloudinary url
            required: true, 
        },
        coverImage: {
            type: String,
        },
        watchHistory :{
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        password: {
            type: String,
            required: [true, 'Password is required'],  
        },
        refreshToken: {
            type: String
        },
},
 { 
    timestamps: true
}
)
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function
(password){
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = funtion(){
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)
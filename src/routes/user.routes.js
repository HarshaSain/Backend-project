import {Router} from "express";
import { loginUser, logoutUser, registerUser , refreshAccessToken} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middle.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
// import { verify } from "jsonwebtoken.js";

const router = Router();
console.log("USER ROUTES LOADED");
router.post("/test", (req, res) => {
    res.send("USER ROUTE WORKING");
});
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    );

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

export default router;
import {Router} from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middle.js";

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

export default router;
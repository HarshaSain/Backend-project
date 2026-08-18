import {v2 as cloudinary} from "cloudinary"
import fs from "fs"                  // in build file system in node js comes bydefault with nodejs
// it helps in read write remove in a file.


    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if (!localFilePath) return null
        //upload
        const response = await loudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        console.log("File is uploaded on cloudinary ", 
        response.url);
        return response

    } catch (error){
        fs.unlinkSync(localFilePath)      //remove the loacaly saved temp file as the upload failed
        return null;
    }
}

export {uploadOnCloudinary}
    

    
    
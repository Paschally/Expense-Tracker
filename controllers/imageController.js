import Image from '../models/imageModel.js';
import {uploadToCloudinary} from '../config/cloud_helper.js'

export const uploadImage = async(req, res) => {
    try{
        // check if file is missing
        if(!req.file){
            return res.status(400).json({
                success: false, 
                message: "File required, pls upload an image"
            })
        }
        // Upload to cloudinary
        const {url, publicId} = await uploadToCloudinary(req.file.path);
        // store image url and public id along with user id
        const newImage = new Image({
            url,
            publicId,
            uploadedBy : req.userInfo.userId
        })

        await newImage.save()
        res.status(201).json({
            success: true,
            message: "Image successfully uploaded"
        })

    } catch(error){
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Image failed to load"
        })
    }
}

export default uploadImage;
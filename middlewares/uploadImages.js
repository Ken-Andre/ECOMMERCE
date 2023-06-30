const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Startup = require("../models/startupModel");
const validateMongoDbId = require("../utils/validateMongodbId");
const cloudinary = require("../utils/cloudinary");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });



const uploadPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoDbId(id);
    
    const startup = await Startup.findById(id);
    if (!startup) {
      throw new Error('Startup not found.');
    }

    const file = req.file;
    if (!file) {
      throw new Error('Please select an image to upload.');
    }

    const image = {
  public_id: file.filename,
  url: `${req.protocol}://${req.get('host')}/images/${file.filename}`
};

    startup.images.push(image);
    await startup.save();

    // Remove _id property from image object
    const updatedImage = {};
    updatedImage.public_id = image.public_id;
    updatedImage.url = image.url;

    res.json({
      success: true,
      message: 'Image uploaded successfully.',
      image: updatedImage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image.'
    });
  }
};

module.exports = { uploadPhoto, upload };

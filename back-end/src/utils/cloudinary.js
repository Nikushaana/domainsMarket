const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Separate storage for image and video
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "domainsProject/images",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "domainsProject/videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "avi"],
  },
});

// Size limits in bytes
const MAX_IMAGE_SIZE = 1; // 1 mb
const MAX_VIDEO_SIZE = 5; // 5 mb

function extractCloudinaryPublicId(url) {
  if (!url) return null;
  const parts = url.split("/").slice(-3).join("/").split(".")[0];
  return parts || null;
}

module.exports = {
  cloudinary,
  imageStorage,
  videoStorage,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  extractCloudinaryPublicId,
};

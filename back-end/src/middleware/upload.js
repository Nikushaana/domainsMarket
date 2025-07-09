const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ImageDir = path.join(__dirname, "..", "..", "uploads", "images");
const VideoDir = path.join(__dirname, "..", "..", "uploads", "videos");

fs.mkdirSync(ImageDir, { recursive: true });
fs.mkdirSync(VideoDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, ImageDir);
    else if (file.mimetype.startsWith("video/")) cb(null, VideoDir);
    else cb(new Error("Unsupported file type"), false);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image or video files are allowed!"), false);
  }
};

const imageLimits = {
  fileSize: 1 * 1024,
};
const videoLimits = {
  fileSize: 1 * 1024 * 1024,
};

module.exports = {
  uploadSingleImage: multer({ storage, fileFilter, imageLimits }).single(
    "image"
  ),
  uploadMultipleImage: multer({ storage, fileFilter, imageLimits }).array(
    "images",
    3
  ),

  uploadSingleVideo: multer({ storage, fileFilter, videoLimits }).single(
    "video"
  ),
  uploadMultipleVideo: multer({ storage, fileFilter, videoLimits }).array(
    "videos",
    2
  ),

  uploadSingleImageAndVideo: multer({
    storage,
    fileFilter,
    limits: videoLimits,
  }).fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),

  uploadMultipleImagesAndVideos: multer({
    storage,
    fileFilter,
    limits: videoLimits,
  }).fields([
    { name: "images", maxCount: 3 },
    { name: "videos", maxCount: 2 },
  ]),
};

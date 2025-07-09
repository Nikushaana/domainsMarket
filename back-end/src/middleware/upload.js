const multer = require("multer");
const path = require("path");
const fs = require("fs");

const ImageDir = path.join(__dirname, "..", "..", "uploads", "images");
const VideoDir = path.join(__dirname, "..", "..", "uploads", "videos");

fs.mkdirSync(ImageDir, { recursive: true });
fs.mkdirSync(VideoDir, { recursive: true });

// const MAX_FILE_SIZE = 3 * 1024 * 1024;
const MAX_FILE_SIZE = 10 * 1024;

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
  if (file.size > MAX_VIDEO_SIZE) {
    return cb(new Error("File size should not exceed 3 MB"), false);
  }
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image or video files are allowed!"), false);
  }
};

const limits = {
  fileSize: MAX_FILE_SIZE,
};

module.exports = {
  uploadSingleImage: multer({ storage, fileFilter, limits }).single("image"),
  uploadMultipleImage: multer({ storage, fileFilter, limits }).array(
    "images",
    3
  ),

  uploadSingleVideo: multer({ storage, fileFilter, limits }).single("video"),
  uploadMultipleVideo: multer({ storage, fileFilter, limits }).array(
    "videos",
    2
  ),

  uploadSingleImageAndVideo: multer({ storage, fileFilter, limits }).fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),

  uploadMultipleImagesAndVideos: multer({ storage, fileFilter, limits }).fields(
    [
      { name: "images", maxCount: 3 },
      { name: "videos", maxCount: 2 },
    ]
  ),
};

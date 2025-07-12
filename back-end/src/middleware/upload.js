const multer = require("multer");
const { imageStorage, videoStorage } = require("../utils/cloudinary");

// === Single Uploads ===
const uploadImage = multer({ storage: imageStorage }).single("image");
const uploadVideo = multer({ storage: videoStorage }).single("video");

// === Combined Upload: Single Image + Single Video ===
const singleStorageSelector = {
  _handleFile(req, file, cb) {
    if (file.fieldname === "image") {
      imageStorage._handleFile(req, file, cb);
    } else if (file.fieldname === "video") {
      videoStorage._handleFile(req, file, cb);
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
  },
  _removeFile(req, file, cb) {
    if (file.fieldname === "image") {
      imageStorage._removeFile(req, file, cb);
    } else if (file.fieldname === "video") {
      videoStorage._removeFile(req, file, cb);
    } else {
      cb(null);
    }
  },
};

const uploadImageAndVideo = multer({ storage: singleStorageSelector }).fields([
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

// === Combined Upload: Multiple Images + Videos ===
const multiStorageSelector = {
  _handleFile(req, file, cb) {
    if (file.fieldname === "images") {
      imageStorage._handleFile(req, file, (err, info) => {
        if (!err) file.storage = "image";
        cb(err, info);
      });
    } else if (file.fieldname === "videos") {
      videoStorage._handleFile(req, file, (err, info) => {
        if (!err) file.storage = "video";
        cb(err, info);
      });
    } else {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
  },
  _removeFile(req, file, cb) {
    if (file.storage === "image") {
      imageStorage._removeFile(req, file, cb);
    } else if (file.storage === "video") {
      videoStorage._removeFile(req, file, cb);
    } else {
      cb(null);
    }
  },
};

const uploadMultipleImagesAndVideos = multer({
  storage: multiStorageSelector,
}).fields([
  { name: "images", maxCount: 3 },
  { name: "videos", maxCount: 2 },
]);

module.exports = {
  uploadImage,
  uploadVideo,
  uploadImageAndVideo,
  uploadMultipleImagesAndVideos,
};

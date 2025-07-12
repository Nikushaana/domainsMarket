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
    transformation: [
       { width: 450, height: 450, crop: "fit" },     // crop: "scale" | "fit" | "fill" | "limit" | "thumb" | "crop"
       { quality: "auto" },                            // quality: "auto" | "auto:good" | "auto:best" | 1-100 (int)
       { fetch_format: "webp" },                       // fetch_format: "auto" | "jpg" | "png" | "webp" | "avif" | etc.
       { dpr: "auto" },                                // dpr: number | "auto" (device pixel ratio for retina)
       { progressive: true },                          // progressive: true | false (progressive JPEG)
      // { effect: "sharpen" },                          // effect: "blur:200" | "sharpen" | "sepia" | "grayscale" | "contrast:30" | etc.
      // { radius: 10 },                                 // radius: number (pixels) | "max" (max rounded corners)
      // { background: "white" },                        // background: color name or hex (e.g. "white" | "#000000")
       { gravity: "auto" },                            // gravity: "auto" | "face" | "center" | "north" | "south" | "east" | "west" | etc.
      // { angle: "0" },                                 // angle: number (degrees) | "auto" | "hflip" | "vflip"
      // { opacity: 80 },                                // opacity: 0 - 100 (percent)
      // { border: "5px_solid_black" },                  // border: "<width>px_solid_<color>" e.g. "5px_solid_black"
       { flags: "force_strip" },                       // flags: "layer_apply" | "animated" | "force_strip" | etc.
    ],
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "domainsProject/videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "avi"],
    transformation: [
       { width: 450, height: 450, crop: "fit" },   // crop: same as images
       { quality: "auto" },                           // quality: "auto" | numeric bitrate presets
       { fetch_format: "webm" },                      // fetch_format: "auto" | "mp4" | "webm" | "ogv" | etc.
       { bit_rate: "1000k" },                         // bit_rate: string (e.g. "500k", "1000k")
       { fps: 30 },                                   // fps: number (frames per second)
    //   { start_offset: "2.0" },                       // start_offset: seconds as number or string
    //   { end_offset: "1.0" },                         // end_offset: seconds as number or string
      //  { audio_codec: "aac" },                        // audio_codec: "none" | "aac" | "mp3" | etc.
      //  { video_codec: "h264" },                       // video_codec: "h264" | "vp8" | "vp9" | etc.
    //   { streaming_profile: "full_hd" },              // streaming_profile: predefined Cloudinary profiles e.g. "full_hd"
       { flags: "force_strip" },                         // flags: "animated" | "layer_apply" | etc.
    //   { overlay: "sample_overlay" },                 // overlay: public ID string or text config object
    //   { opacity: 70 },                               // opacity: 0 - 100 (percent)
       { gravity: "auto" },                     // gravity: same as images
    //   { angle: "0" },                                // angle: same as images
    ],
  },
});

// Size limits in bytes
const MAX_IMAGE_SIZE = 100; // 1 mb
const MAX_VIDEO_SIZE = 500; // 5 mb

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

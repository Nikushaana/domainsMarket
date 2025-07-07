const express = require("express");
const multer = require("multer");

const userAuthMiddleware = require("../middleware/userAuthMiddleware");
const userAuth = require("../controllers/users/userAuthController");
const userInfo = require("../controllers/users/userInfoController");
const userDomain = require("../controllers/users/userDomainController");
const {
  uploadMultipleImagesAndVideos,
  uploadSingleImageAndVideo,
} = require("../middleware/upload");

const router = express.Router();

// user authorization
router.post("/user/register", userAuth.register);
router.post("/user/login", userAuth.login);

router.post("/user/forgotPassword", userAuth.forgotPassword);
router.post("/user/resetPassword", userAuth.resetPassword);

router.post("/user/logout", userAuthMiddleware, userAuth.logout);
// user authorization

// user
router.get("/user", userAuthMiddleware, userInfo.user);
router.put(
  "/user",
  userAuthMiddleware,
  (req, res, next) => {
    uploadMultipleImagesAndVideos(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          if (err.field === "images") {
            return res.status(400).json({ message: "Pick just 3 images max." });
          }
          if (err.field === "videos") {
            return res.status(400).json({ message: "Pick just 2 videos max." });
          }
          return res.status(400).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(500).json({ message: "Server error" });
      }
      next();
    });
  },
  userInfo.userUpdate
);
// user

// user domains
router.get("/user/domains", userAuthMiddleware, userDomain.domains);
router.get("/user/domains/:id", userAuthMiddleware, userDomain.oneDomain);
router.put(
  "/user/domains/:id",
  userAuthMiddleware,
  uploadSingleImageAndVideo,
  userDomain.oneDomainUpdate
);
router.delete(
  "/user/domains/:id",
  userAuthMiddleware,
  userDomain.oneDomainDelete
);
// user domains

module.exports = router;

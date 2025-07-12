const express = require("express");

const userAuthMiddleware = require("../middleware/userAuthMiddleware");
const userAuth = require("../controllers/users/userAuthController");
const userInfo = require("../controllers/users/userInfoController");
const userDomain = require("../controllers/users/userDomainController");
const {
  uploadImageAndVideo,
  uploadMultipleImagesAndVideos,
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
  uploadMultipleImagesAndVideos,
  userInfo.userUpdate
);
// user

// user domains
router.get("/user/domains", userAuthMiddleware, userDomain.domains);
router.get("/user/domains/:id", userAuthMiddleware, userDomain.oneDomain);
router.put(
  "/user/domains/:id",
  userAuthMiddleware,
  uploadImageAndVideo,
  userDomain.oneDomainUpdate
);
router.delete(
  "/user/domains/:id",
  userAuthMiddleware,
  userDomain.oneDomainDelete
);
// user domains

module.exports = router;

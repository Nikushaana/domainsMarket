const express = require("express");

const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const adminAuth = require("../controllers/admins/adminAuthController");
const adminInfo = require("../controllers/admins/adminInfoController");
const adminTokens = require("../controllers/admins/adminTokensController");
const adminDomains = require("../controllers/admins/adminDomainsController");
const adminUsers = require("../controllers/admins/adminUsersController");
const adminAdmins = require("../controllers/admins/adminAdminsController");
const {
  uploadImageAndVideo,
  uploadMultipleImagesAndVideos,
} = require("../middleware/upload");

const router = express.Router();

// admin authorization
router.post("/admin/register", adminAuth.register);
router.post("/admin/login", adminAuth.login);
router.post("/admin/logout", adminAuthMiddleware, adminAuth.logout);
// admin authorization

// admin
router.get("/admin", adminAuthMiddleware, adminInfo.admin);
router.put("/admin", adminAuthMiddleware, adminInfo.adminUpdate);
// admin

// admins
router.get("/admin/admins", adminAuthMiddleware, adminAdmins.admins);
router.get("/admin/admins/:id", adminAuthMiddleware, adminAdmins.oneAdmin);
router.put(
  "/admin/admins/:id",
  adminAuthMiddleware,
  adminAdmins.oneAdminUpdate
);
router.delete(
  "/admin/admins/:id",
  adminAuthMiddleware,
  adminAdmins.oneAdminDelete
);
// admins

// admin tokens
router.get("/admin/adminTokens", adminAuthMiddleware, adminTokens.adminTokens);
router.delete(
  "/admin/adminTokens/:id",
  adminAuthMiddleware,
  adminTokens.adminTokenDelete
);
router.get("/admin/userTokens", adminAuthMiddleware, adminTokens.userTokens);
router.delete(
  "/admin/userTokens/:id",
  adminAuthMiddleware,
  adminTokens.userTokenDelete
);
// admin tokens

// admin domains
router.get("/admin/domains", adminAuthMiddleware, adminDomains.domains);
router.get("/admin/domains/:id", adminAuthMiddleware, adminDomains.oneDomain);
router.put(
  "/admin/domains/:id",
  adminAuthMiddleware,
  uploadImageAndVideo,
  adminDomains.oneDomainUpdate
);
router.delete(
  "/admin/domains/:id",
  adminAuthMiddleware,
  adminDomains.oneDomainDelete
);
// admin domains

// admin users
router.get("/admin/users", adminAuthMiddleware, adminUsers.users);
router.get("/admin/users/:id", adminAuthMiddleware, adminUsers.oneUser);
router.put(
  "/admin/users/:id",
  adminAuthMiddleware,
  uploadMultipleImagesAndVideos,
  adminUsers.oneUserUpdate
);
router.delete(
  "/admin/users/:id",
  adminAuthMiddleware,
  adminUsers.oneUserDelete
);
// admin users

module.exports = router;

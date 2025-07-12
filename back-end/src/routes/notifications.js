const express = require("express");
const router = express.Router();

const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const userAuthMiddleware = require("../middleware/userAuthMiddleware");
const adminOrUserAuthMiddleware = require("../middleware/adminOrUserAuthMiddleware");
const adminAndUserNotifications = require("../controllers/notifications/adminAndUserNotificationsController");

// notifications
router.get(
  "/admin/notifications",
  adminAuthMiddleware,
  adminAndUserNotifications.adminNotifications
);
router.delete(
  "/admin/notifications",
  adminAuthMiddleware,
  adminAndUserNotifications.deleteAdminNotifications
);
router.get(
  "/user/notifications",
  userAuthMiddleware,
  adminAndUserNotifications.userNotifications
);
router.delete(
  "/user/notifications",
  userAuthMiddleware,
  adminAndUserNotifications.deleteOneUserNotifications
);
router.put(
  "/notifications/:id/read",
  adminOrUserAuthMiddleware,
  adminAndUserNotifications.readNotification
);
// notifications

module.exports = router;

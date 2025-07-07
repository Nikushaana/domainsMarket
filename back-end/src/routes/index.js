const express = require("express");
const domainsRouter = require("../routes/domains");
const usersRouter = require("../routes/users");
const adminsRouter = require("../routes/admins");
const notificationsRouter = require("../routes/notifications");

const router = express.Router();

router.use(domainsRouter);
router.use(usersRouter);
router.use(adminsRouter);
router.use(notificationsRouter);

module.exports = router;

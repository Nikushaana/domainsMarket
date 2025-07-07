const express = require("express");
const router = express.Router();

const optionalUserAuthMiddleware = require("../middleware/optionalUserAuthMiddleware");
const frontDomain = require("../controllers/domains/frontDomainController");

// front domain
router.get("/front/domains", frontDomain.domains);
router.get("/front/domains/:id", frontDomain.oneDomain);
router.post(
  "/front/domains",
  optionalUserAuthMiddleware,
  frontDomain.oneDomainAdd
);
// front domain

module.exports = router;

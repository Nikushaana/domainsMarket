const userAuthMiddleware = require("../middleware/userAuthMiddleware");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");

module.exports = async (req, res, next) => {
  try {
    const role = req.query.role;
    if (role === "admin") {
      return adminAuthMiddleware(req, res, next);
    } else if (role === "user") {
      return userAuthMiddleware(req, res, next);
    } else {
      return res.status(400).json({ error: "Invalid role provided in query" });
    }
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

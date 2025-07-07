const jwt = require("jsonwebtoken");
const pool = require("../database/db");
require("dotenv").config();

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const tokenCheck = await pool.query(
        "SELECT * FROM user_tokens WHERE token = $1",
        [token]
      );

      if (tokenCheck.rows.length === 0) {
        return res
          .status(401)
          .json({ error: "Session expired. Please log in again." });
      }
      req.userId = decoded.userId;
    } catch (err) {
      return res
        .status(401)
        .json({ error: "Session expired. Please log in again." });
    }
  }
  next();
};

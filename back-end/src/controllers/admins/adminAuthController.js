const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../../database/db");

const { validateAdmin } = require("../../validation/validateAdmin");

exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { error } = validateAdmin(req.body);
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).send(messages);
    }

    const adminCheck = await pool.query(
      "SELECT * FROM admins WHERE email = $1",
      [email]
    );

    if (adminCheck.rows.length > 0)
      return res
        .status(400)
        .json({ error: "Admin with this Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await pool.query(
      "INSERT INTO admins (email, password) VALUES ($1, $2) RETURNING *",
      [email, hashedPassword]
    );

    res.status(201).json({
      message: "Admin registered successfully",
      admin: newAdmin.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { error } = validateAdmin(req.body);
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).send(messages);
    }

    const admin = await pool.query("SELECT * FROM admins WHERE email = $1", [
      email,
    ]);
    if (admin.rows.length === 0)
      return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, admin.rows[0].password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { adminId: admin.rows[0].id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    await pool.query(
      `INSERT INTO admin_tokens (admin_id, token, created_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (admin_id)
         DO UPDATE SET token = EXCLUDED.token, created_at = NOW()
         RETURNING *`,
      [admin.rows[0].id, token]
    );

    res.json({ message: "admin logged in successfully", admin_token: token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  try {
    await pool.query("DELETE FROM admin_tokens WHERE token = $1", [token]);
    res.json({ message: "Admin logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

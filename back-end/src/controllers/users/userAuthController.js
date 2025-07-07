const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../../database/db");
const { validateUser } = require("../../validation/validateUser");
const { sendResetCode } = require("../../utils/sendEmail")

exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { error } = validateUser(req.body);
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).send(messages);
    }

    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userCheck.rows.length > 0)
      return res
        .status(400)
        .json({ error: "User with this Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [email, hashedPassword]
    );

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { error } = validateUser(req.body);
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).send(messages);
    }

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0)
      return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user.rows[0].id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    await pool.query(
      `INSERT INTO user_tokens (user_id, token, created_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id)
         DO UPDATE SET token = EXCLUDED.token, created_at = NOW()
         RETURNING *`,
      [user.rows[0].id, token]
    );

    res.json({ message: "user logged in successfully", user_token: token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userRes.rows.length === 0)
      return res.status(400).json({ error: "User not found" });

    const user = userRes.rows[0];
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

    await pool.query(
      `INSERT INTO password_reset_codes (user_id, code, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, code, expiresAt]
    );

    await sendResetCode(email, code);

    res.json({ message: "Reset code sent to email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userRes.rows.length === 0)
      return res.status(400).json({ error: "User not found" });

    const user = userRes.rows[0];

    const codeRes = await pool.query(
      `SELECT * FROM password_reset_codes 
       WHERE user_id = $1 AND code = $2 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [user.id, code]
    );

    if (codeRes.rows.length === 0)
      return res.status(400).json({ error: "Invalid or expired code" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      user.id,
    ]);

    await pool.query("DELETE FROM password_reset_codes WHERE user_id = $1", [
      user.id,
    ]);

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  try {
    await pool.query("DELETE FROM user_tokens WHERE token = $1", [token]);
    res.json({ message: "User logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

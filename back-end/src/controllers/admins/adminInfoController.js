const bcrypt = require("bcrypt");
const pool = require("../../database/db");

const { validateAdminUpdate } = require("../../validation/validateAdminUpdate");

exports.admin = async (req, res) => {
  try {
    const admin = await pool.query("SELECT * FROM admins WHERE id = $1", [
      req.adminId,
    ]);
    res.json(admin.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.adminUpdate = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { error } = validateAdminUpdate(req.body);
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).send(messages);
    }

    const existing = await pool.query("SELECT * FROM admins WHERE id = $1", [
      req.adminId,
    ]);

    if (existing.rows.length === 0) {
      return res.status(404).send("The admin with the given ID was not found!");
    }

    let hashedPassword = existing.rows[0].password;

    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const newUser = await pool.query(
      "UPDATE admins SET email = $1, password = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
      [email, hashedPassword, req.adminId]
    );

    res.status(201).send({
      message: "admin updated successfully",
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

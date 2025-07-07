const { validateAdmin } = require("../../validation/validateAdmin");
const bcrypt = require("bcrypt");
const pool = require("../../database/db");

exports.admins = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM admins ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching domains:", err.message);
    res.status(500).send("Server error");
  }
};

exports.oneAdmin = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await pool.query(`SELECT * FROM admins WHERE id = $1`, [id]);

    const admin = result.rows[0];

    if (!admin) {
      return res.status(404).send("The admin with the given ID was not found!");
    }

    res.send(admin);
  } catch (err) {
    console.error("Error fetching one admin:", err.message);
    res.status(500).send("Server error");
  }
};

exports.oneAdminUpdate = async (req, res) => {
  const { email, password } = req.body;
  const id = parseInt(req.params.id);

  try {
    const { error } = validateAdmin(req.body);
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).send(messages);
    }

    const existing = await pool.query("SELECT * FROM admins WHERE id = $1", [
      id,
    ]);
    if (existing.rows.length === 0) {
      return res.status(404).send("The admin with the given ID was not found!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await pool.query(
      "UPDATE admins SET email = $1, password = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
      [email, hashedPassword, id]
    );

    res.status(201).send({
      message: "admin updated successfully",
      admin: newAdmin.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.oneAdminDelete = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await pool.query("SELECT * FROM admins WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).send("The admin with the given ID was not found!");
    }

    await pool.query("DELETE FROM admin_tokens WHERE admin_id = $1", [id]);
    await pool.query("DELETE FROM admins WHERE id = $1", [id]);

    res
      .status(200)
      .send({ message: "admin deleted successfully", admin: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

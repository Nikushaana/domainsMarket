const pool = require("../../database/db");

exports.adminTokens = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM admin_tokens ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching admin tokens:", err.message);
    res.status(500).send("Server error");
  }
};

exports.adminTokenDelete = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await pool.query(
      "SELECT * FROM admin_tokens WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .send("The admin token with the given ID was not found!");
    }

    await pool.query("DELETE FROM admin_tokens WHERE id = $1", [id]);

    res.status(200).send({
      message: "admin token deleted successfully",
      admin_token: result.rows[0],
    });
  } catch (err) {
    console.error("Error fetching admin tokens:", err.message);
    res.status(500).send("Server error");
  }
};

exports.userTokens = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM user_tokens ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user tokens:", err.message);
    res.status(500).send("Server error");
  }
};

exports.userTokenDelete = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await pool.query("SELECT * FROM user_tokens WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .send("The user token with the given ID was not found!");
    }

    await pool.query("DELETE FROM user_tokens WHERE id = $1", [id]);

    res.status(200).send({
      message: "user token deleted successfully",
      admin_token: result.rows[0],
    });
  } catch (err) {
    console.error("Error fetching user tokens:", err.message);
    res.status(500).send("Server error");
  }
};

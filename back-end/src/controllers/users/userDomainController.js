const pool = require("../../database/db");
const { validateDomain } = require("../../validation/validateDomain");
const fs = require("fs");
const sendNotification = require("../../utils/sendNotification");

exports.domains = async (req, res) => {
  const { status } = req.query;

  try {
    const result = await pool.query(
      `SELECT * FROM domains WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC`,
      [req.userId, parseInt(status)]
    );

    return res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error");
  }
};

exports.oneDomain = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await pool.query(
      `SELECT * FROM domains WHERE user_id = $1 AND id = $2`,
      [req.userId, id]
    );

    const domain = result.rows[0];

    if (!domain) {
      return res
        .status(404)
        .send("The domain of this user with the given ID was not found!");
    }

    res.send(domain);
  } catch (err) {
    console.error("Error fetching user's one domain:", err.message);
    res.status(500).send("Server error");
  }
};

exports.oneDomainUpdate = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await pool.query(
      "SELECT * FROM domains WHERE user_id = $1 AND id = $2",
      [req.userId, id]
    );

    if (existing.rows.length === 0) {
      return res
        .status(404)
        .send("The domain of this user with the given ID was not found!");
    }

    const { error } = validateDomain(req.body);
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).send(messages);
    }

    const { name, description, deleteImage, deleteVideo } = req.body;

    // image
    let imagePath = "";

    if (deleteImage == "true") {
      fs.unlink(existing.rows[0].image, (err) => {
        if (err) console.error("Error deleting image:", err.message);
        else console.log("Image deleted successfully.");
      });
    }

    if (req.files.image) {
      if (existing.rows[0].image) {
        fs.unlink(existing.rows[0].image, (err) => {
          if (err) console.error("Error deleting image:", err.message);
          else console.log("Image deleted successfully.");
        });
      }
      imagePath = `uploads/images/${req.files.image[0].filename}`;
    } else if (deleteImage == "true") {
      imagePath = "";
    } else if (existing.rows[0].image) {
      imagePath = existing.rows[0].image;
    }
    // image

    // video
    let videoPath = "";

    if (deleteVideo == "true") {
      fs.unlink(existing.rows[0].video, (err) => {
        if (err) console.error("Error deleting video:", err.message);
        else console.log("Video deleted successfully.");
      });
    }

    if (req.files.video) {
      if (existing.rows[0].video) {
        fs.unlink(existing.rows[0].video, (err) => {
          if (err) console.error("Error deleting video:", err.message);
          else console.log("Video deleted successfully.");
        });
      }
      videoPath = `uploads/videos/${req.files.video[0].filename}`;
    } else if (deleteVideo == "true") {
      videoPath = "";
    } else if (existing.rows[0].video) {
      videoPath = existing.rows[0].video;
    }
    // video

    const result = await pool.query(
      "UPDATE domains SET name = $1, description = $2, image = $3, video = $4, updated_at = NOW() WHERE id = $5 RETURNING *",
      [name, description, imagePath, videoPath, id]
    );

    const io = req.app.get("io");

    await sendNotification({
      io,
      room: "admin",
      event: "admin:domain_updated_by_user",
      userId: existing.rows[0].user_id,
      message: `User ${existing.rows[0].user_id} updated Domain "${result.rows[0].name}".`,
      data: result.rows[0],
    });

    if (existing.rows[0].user_id) {
      await sendNotification({
        io,
        room: `user_${existing.rows[0].user_id}`,
        event: "user:domain_updated_by_user",
        userId: existing.rows[0].user_id,
        message: `You updated Your domain "${result.rows[0].name}".`,
        data: result.rows[0],
      });
    }

    res.status(201).send({
      message: "domain updated successfully",
      domain: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.oneDomainDelete = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await pool.query(
      "SELECT * FROM domains WHERE user_id = $1 AND id = $2",
      [req.userId, id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .send("The domain of this user with the given ID was not found!");
    }

    fs.unlink(result.rows[0].image, (err) => {
      if (err) console.error("Failed to delete image:", err.message);
      else console.log("Image Deleted successfully");
    });

    await pool.query("DELETE FROM domains WHERE id = $1", [id]);

    const io = req.app.get("io");

    await sendNotification({
      io,
      room: "admin",
      event: "admin:domain_deleted_by_user",
      userId: result.rows[0].user_id,
      message: `User ${result.rows[0].user_id} deleted Domain "${result.rows[0].name}".`,
      data: result.rows[0],
    });

    if (result.rows[0].user_id) {
      await sendNotification({
        io,
        room: `user_${result.rows[0].user_id}`,
        event: "user:domain_deleted_by_user",
        userId: result.rows[0].user_id,
        message: `You deleted Your domain "${result.rows[0].name}".`,
        data: result.rows[0],
      });
    }

    res
      .status(201)
      .send({ message: "domain deleted successfully", domain: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

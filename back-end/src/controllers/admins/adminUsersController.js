const { validateUserUpdate } = require("../../validation/validateUserUpdate");
const bcrypt = require("bcrypt");
const pool = require("../../database/db");
const fs = require("fs");
const onlineUsers = require("../../utils/onlineUsers");

exports.users = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY created_at DESC"
    );
    const onlineUserIds = Array.from(onlineUsers.keys());
    res.json({ users: result.rows, onlineUsers: onlineUserIds });
  } catch (err) {
    console.error("Error fetching domains:", err.message);
    res.status(500).send("Server error");
  }
};

exports.oneUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);

    const user = result.rows[0];

    if (!user) {
      return res.status(404).send("The user with the given ID was not found!");
    }

    res.send(user);
  } catch (err) {
    console.error("Error fetching one user:", err.message);
    res.status(500).send("Server error");
  }
};

exports.oneUserUpdate = async (req, res) => {
  const { email, password, deletedImages, deletedVideos } = req.body;

  try {
    const { error } = validateUserUpdate(req.body);
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).send(messages);
    }

    const id = parseInt(req.params.id);

    const existing = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);

    if (existing.rows.length === 0) {
      return res.status(404).send("The user with the given ID was not found!");
    }

    let hashedPassword = existing.rows[0].password;

    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // images
    let imagesPaths = existing.rows[0].images || [];

    let deletedImagesArray = [];

    if (typeof deletedImages === "string") {
      try {
        deletedImagesArray = JSON.parse(deletedImages);
      } catch (e) {
        return res.status(400).send("Invalid deletedImages JSON format");
      }
    } else if (Array.isArray(deletedImages)) {
      deletedImagesArray = deletedImages;
    } else {
      deletedImagesArray = [];
    }

    if (deletedImagesArray.length > 0) {
      imagesPaths = imagesPaths.filter(
        (img) => !deletedImagesArray.includes(img)
      );
      deletedImagesArray.forEach((imgPath) => {
        fs.unlink(imgPath, (err) => {
          if (err) console.error("Error deleting images:", err.message);
          else console.log("Images deleted successfully.");
        });
      });
    }

    if (req.files.images && imagesPaths.length + req.files.images.length > 3) {
      return res.status(400).send({ message: "Pick just 3 images max." });
    }

    if (req.files.images && req.files.images.length > 0) {
      const newImagePaths = req.files.images.map(
        (file) => `uploads/images/${file.filename}`
      );
      imagesPaths = [...imagesPaths, ...newImagePaths];
    }
    // images

    // videos
    let videosPaths = existing.rows[0].videos || [];

    let deletedVideosArray = [];

    if (typeof deletedVideos === "string") {
      try {
        deletedVideosArray = JSON.parse(deletedVideos);
      } catch (e) {
        return res.status(400).send("Invalid deletedVideos JSON format");
      }
    } else if (Array.isArray(deletedVideos)) {
      deletedVideosArray = deletedVideos;
    } else {
      deletedVideosArray = [];
    }

    if (deletedVideosArray.length > 0) {
      videosPaths = videosPaths.filter(
        (vid) => !deletedVideosArray.includes(vid)
      );
      deletedVideosArray.forEach((imgPath) => {
        fs.unlink(imgPath, (err) => {
          if (err) console.error("Error deleting videos:", err.message);
          else console.log("Videos deleted successfully.");
        });
      });
    }

    if (req.files.videos && videosPaths.length + req.files.videos.length > 2) {
      return res.status(400).send({ message: "Pick just 2 videos max." });
    }

    if (req.files.videos && req.files.videos.length > 0) {
      const newVideoPaths = req.files.videos.map(
        (file) => `uploads/videos/${file.filename}`
      );
      videosPaths = [...videosPaths, ...newVideoPaths];
    }
    // videos

    const newUser = await pool.query(
      "UPDATE users SET images = $1, videos = $2, email = $3, password = $4, updated_at = NOW() WHERE id = $5 RETURNING *",
      [imagesPaths, videosPaths, email, hashedPassword, id]
    );

    res.status(201).send({
      message: "user updated successfully",
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.oneUserDelete = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

    if (result.rows?.length === 0) {
      return res.status(404).send("The user with the given ID was not found!");
    }

    if (result.rows[0].images?.length > 0) {
      result.rows[0].images?.forEach((imgPath) => {
        fs.unlink(imgPath, (err) => {
          if (err) console.error("Error deleting images:", err.message);
          else console.log("Images deleted successfully.");
        });
      });
    }
    await pool.query("UPDATE domains SET user_id = null WHERE user_id = $1", [
      id,
    ]);
    await pool.query("DELETE FROM user_tokens WHERE user_id = $1", [id]);
    await pool.query("DELETE FROM users WHERE id = $1", [id]);

    res
      .status(200)
      .send({ message: "user deleted successfully", user: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

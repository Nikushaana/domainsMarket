const { validateUserUpdate } = require("../../validation/validateUserUpdate");
const bcrypt = require("bcrypt");
const pool = require("../../database/db");
const onlineUsers = require("../../utils/onlineUsers");

const {
  cloudinary,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  extractCloudinaryPublicId,
} = require("../../utils/cloudinary");

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

    const existingResult = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).send("The user with the given ID was not found!");
    }

    const existing = existingResult.rows[0];

    let hashedPassword = existing.password;

    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // images videos update
    let imagesPaths = existing.images || [];
    let videosPaths = existing.videos || [];
    let deletedImagesArray = [];
    let deletedVideosArray = [];

    // Parse deleted images/videos lists
    if (deletedImages) {
      deletedImagesArray =
        typeof deletedImages === "string" && deletedImages.trim() !== ""
          ? JSON.parse(deletedImages)
          : Array.isArray(deletedImages)
          ? deletedImages
          : [];
    }

    if (deletedVideos) {
      deletedVideosArray =
        typeof deletedVideos === "string" && deletedVideos.trim() !== ""
          ? JSON.parse(deletedVideos)
          : Array.isArray(deletedVideos)
          ? deletedVideos
          : [];
    }

    // images/videos delete
    for (const url of deletedImagesArray) {
      const publicId = extractCloudinaryPublicId(url);

      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });
          imagesPaths = imagesPaths.filter((img) => img !== url);
          console.error("Cloudinary image deleted");
        } catch (err) {
          console.error("Cloudinary image delete failed:", err);
        }
      }
    }

    for (const url of deletedVideosArray) {
      const publicId = extractCloudinaryPublicId(url);

      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
          });
          videosPaths = videosPaths.filter((vid) => vid !== url);
          console.error("Cloudinary video deleted");
        } catch (err) {
          console.error("Cloudinary video delete failed:", err);
        }
      }
    }

    // images/videos update

    if (req.files?.images?.length > 0) {
      const newImagePaths = req.files.images.map((file) => file.path);

      if (
        req.files?.images?.find(
          (img) => img.size > MAX_IMAGE_SIZE * 1024 * 1024
        )
      ) {
        for (const file of req.files.images) {
          const publicId = extractCloudinaryPublicId(file.path);

          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId, {
                resource_type: "image",
              });
              console.error("Cloudinary images deleted because size");
            } catch (err) {
              console.error(
                "Cloudinary images deleted because size failed:",
                err
              );
            }
          }
          return res
            .status(400)
            .send(`Images must be under ${MAX_IMAGE_SIZE}MB`);
        }
      } else {
        imagesPaths = [...imagesPaths, ...newImagePaths];
      }
    }

    if (imagesPaths?.length > 3) {
      if (req.files?.images?.length > 0) {
        for (const file of req.files.images) {
          const publicId = extractCloudinaryPublicId(file.path);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId, {
                resource_type: "image",
              });
              console.log(`Deleted excess image: ${publicId}`);
            } catch (err) {
              console.error("Failed to delete excess image:", err);
            }
          }
        }
      }
      return res.status(400).json({
        error: "Pick just 3 images max.",
      });
    }

    if (req.files?.videos?.length > 0) {
      const newVideoPaths = req.files.videos.map((file) => file.path);
      if (
        req.files?.videos?.find(
          (vid) => vid.size > MAX_VIDEO_SIZE * 1024 * 1024
        )
      ) {
        for (const file of req.files.videos) {
          const publicId = extractCloudinaryPublicId(file.path);

          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId, {
                resource_type: "video",
              });
              console.error("Cloudinary videos deleted because size");
            } catch (err) {
              console.error(
                "Cloudinary videos deleted because size failed:",
                err
              );
            }
          }
          return res
            .status(400)
            .send(`Videos must be under ${MAX_VIDEO_SIZE}MB`);
        }
      } else {
        videosPaths = [...videosPaths, ...newVideoPaths];
      }
    }

    if (videosPaths?.length > 2) {
      if (req.files?.videos?.length > 0) {
        for (const file of req.files.videos) {
          const publicId = extractCloudinaryPublicId(file.path);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId, {
                resource_type: "video",
              });
              console.log(`Deleted excess video: ${publicId}`);
            } catch (err) {
              console.error("Failed to delete excess video:", err);
            }
          }
        }
      }
      return res.status(400).json({
        error: "Pick just 2 videos max.",
      });
    }

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

    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);

    if (userResult.rows?.length === 0) {
      return res.status(404).send("The user with the given ID was not found!");
    }

    const user = userResult.rows[0];
    // images/videos delete
    for (const url of user.images) {
      const publicId = extractCloudinaryPublicId(url);

      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });
          imagesPaths = imagesPaths.filter((img) => img !== url);
          console.error("Cloudinary image deleted");
        } catch (err) {
          console.error("Cloudinary image delete failed:", err);
        }
      }
    }

    for (const url of user.videos) {
      const publicId = extractCloudinaryPublicId(url);

      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
          });
          videosPaths = videosPaths.filter((vid) => vid !== url);
          console.error("Cloudinary video deleted");
        } catch (err) {
          console.error("Cloudinary video delete failed:", err);
        }
      }
    }

    await pool.query("UPDATE domains SET user_id = null WHERE user_id = $1", [
      id,
    ]);
    await pool.query(
      `DELETE FROM notifications WHERE type LIKE 'user:%' AND "user_id" = $1`,
      [id]
    );
    await pool.query("DELETE FROM user_tokens WHERE user_id = $1", [id]);
    await pool.query("DELETE FROM users WHERE id = $1", [id]);

    res.status(200).send({ message: "user deleted successfully", user: user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

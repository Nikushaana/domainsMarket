const pool = require("../../database/db");
const { validateDomain } = require("../../validation/validateDomain");
const sendNotification = require("../../utils/sendNotification");

const {
  cloudinary,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  extractCloudinaryPublicId,
} = require("../../utils/cloudinary");


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

    // validation
    const { error } = validateDomain(req.body);
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).send(messages);
    }

    // update
    const { name, description, deleteImage, deleteVideo } = req.body;

    // image video update
    const oldImageUrl = existing.rows[0].image;
    const oldVideoUrl = existing.rows[0].video;
    let imagePath = oldImageUrl;
    let videoPath = oldVideoUrl;

    if (req.files?.image?.[0]?.path || deleteImage == "true") {
      const publicId = extractCloudinaryPublicId(oldImageUrl);

      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });
          console.error("Cloudinary image deleted");
          imagePath = "";
        } catch (err) {
          console.error("Cloudinary image delete failed:", err);
        }
      }

      if (req.files?.image?.[0]?.path) {
        if (req.files?.image?.[0].size < MAX_IMAGE_SIZE * 1024 * 1024) {
          imagePath = req.files?.image?.[0]?.path;
        } else {
          const publicId = extractCloudinaryPublicId(
            req.files?.image?.[0]?.path
          );

          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId, {
                resource_type: "image",
              });
              console.error("Cloudinary image deleted because size");
              imagePath = "";
            } catch (err) {
              console.error(
                "Cloudinary image delete because size failed:",
                err
              );
            }
          }
          return res
            .status(400)
            .send(`Image must be under ${MAX_IMAGE_SIZE}MB`);
        }
      }
    }

    if (req.files?.video?.[0]?.path || deleteVideo == "true") {
      const publicId = extractCloudinaryPublicId(oldVideoUrl);

      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
          });
          console.error("Cloudinary video deleted");
          videoPath = "";
        } catch (err) {
          console.error("Cloudinary video delete failed:", err);
        }
      }

      if (req.files?.video?.[0]?.path) {
        if (req.files?.video?.[0].size < MAX_VIDEO_SIZE * 1024 * 1024) {
          videoPath = req.files?.video?.[0]?.path;
        } else {
          const publicId = extractCloudinaryPublicId(
            req.files?.image?.[0]?.path
          );

          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId, {
                resource_type: "video",
              });
              console.error("Cloudinary video deleted because size");
              imagePath = "";
            } catch (err) {
              console.error(
                "Cloudinary video delete because size failed:",
                err
              );
            }
          }
          return res
            .status(400)
            .send(`Video must be under ${MAX_VIDEO_SIZE}MB`);
        }
      }
    }

    // save
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

    const domain = result.rows[0];

    // image delete
    if (domain.image) {
      const publicId = extractCloudinaryPublicId(domain.image);

      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
          });
          console.error("Cloudinary image deleted");
        } catch (err) {
          console.error("Cloudinary image delete failed:", err);
        }
      }
    }

    // video delete
    if (domain.video) {
      const publicId = extractCloudinaryPublicId(domain.video);

      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
          });
          console.error("Cloudinary video deleted");
        } catch (err) {
          console.error("Cloudinary video delete failed:", err);
        }
      }
    }

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

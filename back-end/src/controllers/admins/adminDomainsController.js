const { validateDomain } = require("../../validation/validateDomain");
const pool = require("../../database/db");
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
      `SELECT 
        d.id as domain_id, d.name as domain_name, d.status as domain_status, d.created_at as domain_created_at, d.updated_at as domain_updated_at, d.description as domain_description, d.user_id as domain_user_id, d.image as domain_image, d.video as domain_video,
        u.id as user_id, u.email as user_email, u.created_at as user_created_at, u.updated_at as user_updated_at, u.images as user_images
        FROM domains d
        LEFT JOIN users u ON d.user_id = u.id
        WHERE d.status = $1
        ORDER BY d.created_at DESC`,
      [status]
    );

    const domainsWithUser = result.rows.map((row) => {
      return {
        id: row.domain_id,
        name: row.domain_name,
        description: row.domain_description,
        status: row.domain_status,
        created_at: row.domain_created_at,
        updated_at: row.domain_updated_at,
        user_id: row.domain_user_id,
        image: row.domain_image,
        video: row.domain_video,
        user: row.user_id
          ? {
              id: row.user_id,
              email: row.user_email,
              created_at: row.user_created_at,
              updated_at: row.user_updated_at,
              images: row.user_images,
            }
          : null,
      };
    });

    return res.json(domainsWithUser);
  } catch (err) {
    console.error("Error fetching domains:", err.message);
    res.status(500).send("Server error");
  }
};

exports.oneDomain = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const result = await pool.query(
      `SELECT 
        d.id as domain_id, d.name as domain_name, d.status as domain_status, d.created_at as domain_created_at, d.updated_at as domain_updated_at, d.description as domain_description, d.user_id as domain_user_id, d.image as domain_image, d.video as domain_video,
        u.id as user_id, u.email as user_email, u.created_at as user_created_at, u.updated_at as user_updated_at, u.images as user_images
        FROM domains d
        LEFT JOIN users u ON d.user_id = u.id
        WHERE d.id = $1
      `,
      [id]
    );

    const domainsWithUser = result.rows.map((row) => {
      return {
        id: row.domain_id,
        name: row.domain_name,
        description: row.domain_description,
        status: row.domain_status,
        created_at: row.domain_created_at,
        updated_at: row.domain_updated_at,
        user_id: row.domain_user_id,
        image: row.domain_image,
        video: row.domain_video,
        user: row.user_id
          ? {
              id: row.user_id,
              email: row.user_email,
              created_at: row.user_created_at,
              updated_at: row.user_updated_at,
              images: row.user_images,
            }
          : null,
      };
    });

    if (!domainsWithUser) {
      return res
        .status(404)
        .send("The domain with the given ID was not found!");
    }

    return res.json(domainsWithUser);
  } catch (err) {
    console.error("Error fetching one domains:", err.message);
    res.status(500).send("Server error");
  }
};

exports.oneDomainUpdate = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await pool.query("SELECT * FROM domains WHERE id = $1", [
      id,
    ]);

    if (existing.rows.length === 0) {
      return res
        .status(404)
        .send("The domain with the given ID was not found!");
    }

    const { error } = validateDomain(req.body);
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).send(messages);
    }

    const { name, description, status, deleteImage, deleteVideo } = req.body;

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
      "UPDATE domains SET name = $1, description = $2, status = $3, image = $4, video = $5, updated_at = NOW() WHERE id = $6 RETURNING *",
      [name, description, status, imagePath, videoPath, id]
    );

    const io = req.app.get("io");

    await sendNotification({
      io,
      room: "admin",
      event: "admin:domain_updated_by_admin",
      userId: existing.rows[0].user_id,
      message: `${
        existing.rows[0].user_id
          ? `User ${existing.rows[0].user_id}'s`
          : "Guest's"
      } Domain "${result.rows[0].name}" was ${
        status !== existing.rows[0].status
          ? status == 1
            ? "Verified"
            : "Blocked"
          : "Updated"
      } by admin.`,
      data: result.rows[0],
    });

    if (existing.rows[0].user_id) {
      await sendNotification({
        io,
        room: `user_${existing.rows[0].user_id}`,
        event: "user:domain_updated_by_admin",
        userId: existing.rows[0].user_id,
        message: `Your domain "${result.rows[0].name}" was 
        ${
          status !== existing.rows[0].status
            ? status == 1
              ? "Verified"
              : "Blocked"
            : "Updated"
        } 
        by Admin.`,
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

    const result = await pool.query("SELECT * FROM domains WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .send("The domain with the given ID was not found!");
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
      event: "admin:domain_deleted_by_admin",
      userId: result.rows[0].user_id,
      message: `${
        result.rows[0].user_id ? `User ${result.rows[0].user_id}'s` : "Guest's"
      } Domain "${result.rows[0].name}" was deleted by admin.`,
      data: result.rows[0],
    });

    if (result.rows[0].user_id) {
      await sendNotification({
        io,
        room: `user_${result.rows[0].user_id}`,
        event: "user:domain_deleted_by_admin",
        userId: result.rows[0].user_id,
        message: `Your domain "${result.rows[0].name}" was deleted by Admin.`,
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

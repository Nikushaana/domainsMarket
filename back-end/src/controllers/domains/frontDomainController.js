const { validateDomain } = require("../../validation/validateDomain");
const pool = require("../../database/db");
const sendNotification = require("../../utils/sendNotification");

exports.domains = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM domains WHERE status = 1`
    );
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    const result = await pool.query(
      `SELECT 
        d.id as domain_id, d.name as domain_name, d.status as domain_status, d.created_at as domain_created_at, d.updated_at as domain_updated_at, d.description as domain_description, d.user_id as domain_user_id, d.image as domain_image, d.video as domain_video,
        u.id as user_id, u.email as user_email, u.created_at as user_created_at, u.updated_at as user_updated_at, u.images as user_images
        FROM domains d
        LEFT JOIN users u ON d.user_id = u.id
        WHERE d.status = 1
        ORDER BY d.created_at DESC
        LIMIT $1 OFFSET $2`,
      [limit, offset]
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

    return res.json({
      currentPage: page,
      limit,
      totalPages,
      totalItems: total,
      data: domainsWithUser,
    });
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
        WHERE d.id = $1 AND d.status = 1`,
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

exports.oneDomainAdd = async (req, res) => {
  try {
    const { error } = validateDomain(req.body);
    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).send(messages);
    }

    const result = await pool.query(
      "INSERT INTO domains (name, user_id) VALUES ($1, $2) RETURNING *",
      [req.body.name, req.userId]
    );

    const domain = result.rows[0];

    const io = req.app.get("io");

    await sendNotification({
      io,
      room: "admin",
      event: "admin:domain_request",
      userId: req.userId,
      message: `${
        req.userId ? `User ${req.userId}` : "Guest"
      } requested to add domain "${domain.name}"`,
      data: { domain },
    });

    if (req.userId) {
      await sendNotification({
        io,
        room: `user_${req.userId}`,
        event: "user:domain_requested",
        userId: req.userId,
        message: `Your domain "${domain.name}" was submitted for review.`,
        data: { domain },
      });
    }

    res.status(201).send({
      message: "The domain will be added after admin approval.",
      domain: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

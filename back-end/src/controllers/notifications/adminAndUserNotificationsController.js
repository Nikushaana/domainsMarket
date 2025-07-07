const pool = require("../../database/db");

exports.adminNotifications = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE type LIKE 'admin:%'`
    );
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    const result = await pool.query(
      `SELECT * FROM notifications WHERE type LIKE 'admin:%' ORDER BY read ASC, created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const unreadCount = await pool.query(
      `SELECT COUNT(*) FROM notifications 
       WHERE type LIKE 'admin:%' AND read = false`
    );

    const unseenCount = parseInt(unreadCount.rows[0].count);

    res.json({
      currentPage: page,
      limit,
      unseenCount,
      totalPages,
      totalItems: total,
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.deleteAdminNotifications = async (req, res) => {
  try {
    await pool.query("DELETE FROM notifications WHERE type LIKE 'admin:%'");

    res.status(200).send({
      message: "admin notifications deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting admin notifications:", err.message);
    res.status(500).send("Server error");
  }
};

exports.userNotifications = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const userId = req.userId;

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE type LIKE 'user:%' AND "user_id" = $1`,
      [userId]
    );
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    const result = await pool.query(
      `SELECT * FROM notifications WHERE type LIKE 'user:%' AND "user_id" = $1 ORDER BY read ASC, created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const unreadCount = await pool.query(
      `SELECT COUNT(*) FROM notifications 
       WHERE type LIKE 'user:%' AND "user_id" = $1 AND read = false`,
      [userId]
    );

    const unseenCount = parseInt(unreadCount.rows[0].count);

    res.json({
      currentPage: page,
      limit,
      unseenCount,
      totalPages,
      totalItems: total,
      data: result.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.deleteOneUserNotifications = async (req, res) => {
  const userId = req.userId;
  try {
    await pool.query(
      `DELETE FROM notifications WHERE type LIKE 'user:%' AND "user_id" = $1`,
      [userId]
    );

    res.status(200).send({
      message: `user ${userId} notifications deleted successfully`,
    });
  } catch (err) {
    console.error(`Error deleting user ${userId} notifications`, err.message);
    res.status(500).send("Server error");
  }
};
exports.readNotification = async (req, res) => {
  const notificationId = req.params.id;
  try {
    const result = await pool.query(
      `UPDATE notifications SET read = TRUE WHERE id = $1 RETURNING *`,
      [notificationId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.json({ success: true, notification: result.rows[0] });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

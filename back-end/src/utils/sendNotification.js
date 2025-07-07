const pool = require("../database/db");

const sendNotification = async ({ io, room, event, userId, message, data }) => {
  await pool.query(
    `INSERT INTO notifications (user_id, type, message) VALUES ($1, $2, $3)`,
    [userId, event, message]
  );

  io.to(room).emit(event, {
    userId,
    message,
    data,
    timestamp: new Date(),
  });
};

module.exports = sendNotification;

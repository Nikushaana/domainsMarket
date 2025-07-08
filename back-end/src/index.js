const cors = require("cors");
const express = require("express");
const path = require("path");
const pool = require("./database/db");

const http = require("http");
const { Server } = require("socket.io");

const allRouter = require("./routes/index");
require("dotenv").config();

const onlineUsers = require("./utils/onlineUsers");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://domains-market.vercel.app"],
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  const { role, userId } = socket.handshake.query;
  const userIdInt = parseInt(userId, 10);

  if (role === "admin") {
    socket.join("admin");
    console.log(`Admin joined room with socket ID ${socket.id}`);
  }

  if (role === "user" && !isNaN(userIdInt)) {
    socket.join(`user_${userIdInt}`);

    const count = onlineUsers.get(userIdInt) || 0;
    onlineUsers.set(userIdInt, count + 1);
    io.to("admin").emit("user:connected", userIdInt);
    console.log(`User ${userIdInt} connected, sockets count: ${count + 1}`);
  }

  socket.on("disconnect", async () => {
    if (role === "admin") {
      console.log(`Admin socket ${socket.id} disconnected`);
    }

    if (role === "user" && !isNaN(userIdInt)) {
      const count = onlineUsers.get(userIdInt) || 1;
      if (count <= 1) {
        onlineUsers.delete(userIdInt);
        io.to("admin").emit("user:disconnected", userIdInt);
        try {
          await pool.query("UPDATE users SET last_seen = NOW() WHERE id = $1", [
            userIdInt,
          ]);
          console.log(`Updated last_seen for user ${userIdInt}`);
        } catch (err) {
          console.error("Error updating last_seen:", err);
        }
        console.log(`User ${userIdInt} disconnected, no more sockets`);
      } else {
        onlineUsers.set(userIdInt, count - 1);
        console.log(
          `User ${userIdInt} disconnected one socket, remaining: ${count - 1}`
        );
      }
    }
  });
});

app.use(
  cors({
    origin: "https://domains-market.vercel.app",
  })
);

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use(allRouter);

app.get("/", (req, res) => {
  res.send("Hello world!!!");
});

// PORT

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => console.log(`Listening on port ${PORT}...`));

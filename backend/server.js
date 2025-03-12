require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const connectDb = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const server = createServer(app);

const allowedOrigins = [
  "https://echomeet1.netlify.app", // ✅ Netlify frontend
  "http://localhost:3000", // ✅ Local testing
];

// CORS configuration for Express (REST API)
app.use(
  cors({
    origin: allowedOrigins,
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // Allows cookies and authentication headers
  })
);

app.use(express.json());

// Socket.io configuration - Explicitly allow CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Database Connection
connectDb();

// Routes
app.use("/api/auth", authRoutes);

// WebRTC Signaling with Socket.io
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ callId }) => {
    socket.join(callId);
    console.log(`User joined room: ${callId}`);
  });

  socket.on("offer", ({ offer, callId }) => {
    socket.to(callId).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ answer, to }) => {
    socket.to(to).emit("answer", { answer });
  });

  socket.on("candidate", ({ candidate, to }) => {
    socket.to(to).emit("candidate", { candidate });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const connectDb = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const server = createServer(app);

// Allow CORS for both Netlify frontend and local development
const allowedOrigins = [
  "https://echomeet1.netlify.app",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // Allows cookies and authentication headers
  })
);

app.use(express.json());

// Database Connection
connectDb();

// Routes
app.use("/api/auth", authRoutes);

// WebRTC Signaling with Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

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
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

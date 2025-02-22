import express from "express";
import userRouter from "./routes/user";
import projectRouter from "./routes/project";
import followRouter from "./routes/follow";
import authRouter from "./routes/auth";
import postRouter from "./routes/post";
import messageRouter from "./routes/message";
import { PrismaClient } from "@prisma/client";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import {authMiddleware} from "./middleware/authMiddleware"; // Import your auth middleware

const app = express();
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const prisma = new PrismaClient();

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/follow", followRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/message", messageRouter);

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup with authentication
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Authenticate Socket.IO connections
io.use((socket, next) => {
  authMiddleware(socket.request as express.Request, {} as any, (err?: any) => {
    if (err) {
      return next(new Error(err));
    }
    next();
  });
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("New User Connected: ", socket.id);

  // Extract senderId from authenticated user
  const senderId = (socket.request as any).user?.id;

  // Join room event
  socket.on("joinRoom", ({ receiverId }) => {
    if (!senderId || !receiverId) return;

    const room = [senderId, receiverId].sort().join("_");
    socket.join(room);
    socket.data.userId = senderId;
    console.log(`User ${senderId} joined room ${room}`);
  });

  // Send message event
  socket.on("sendMessage", async ({ receiverId, content }) => {
    if (!senderId || !receiverId || !content) return;

    try {
      const message = await prisma.message.create({
        data: { senderId, receiverId, content, read: false },
      });

      const room = [senderId, receiverId].sort().join("_");
      io.to(room).emit("receiveMessage", message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // Disconnect event
  socket.on("disconnect", async () => {
    if (senderId) {
      await prisma.user.update({
        where: { id: senderId },
        data: { isOnline: false },
      });
      io.emit("updateUserStatus", { userId: senderId, isOnline: false });
    }
    console.log("User disconnected:", socket.id);
  });
});

// Error middleware
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
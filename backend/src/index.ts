import express from "express";
import userRouter from "./routes/user";
import followRouter from "./routes/follow";
import authRouter from "./routes/auth";
import postRouter from "./routes/post";
import messageRouter from "./routes/message";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import { authMiddleware } from "./middleware/authMiddleware";
import { v2 as cloudinary } from 'cloudinary';


const app = express();
app.use(
  cors({
    origin: "https://networking-app-navy.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

// Routes;
app.use('/uploads', express.static(path.join(__dirname, './uploads')));
app.use("/api/v1/user", userRouter);
app.use("/api/v1/follow", followRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/message", messageRouter);

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup with authentication
const io = new Server(server, {
  cors: {
    origin: "https://networking-app-navy.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Authenticate Socket.IO connections
io.use((socket, next) => {
  // Extract token from handshake auth
  const token = socket.handshake.auth.token;
  console.log("token " + token)
  if (!token) {
    return next(new Error("Invalid User / User not logged in"));
  }

  // Attach token to the request object for authMiddleware
  socket.request.headers = { authorization: `Bearer ${token}` };

  // Use your auth middleware
  authMiddleware(socket.request as express.Request, {} as any, (err?: any) => {
    if (err) {
      return next(new Error("Authentication failed"));
    }
    next();
  });
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log("New User Connected:", socket.id);

  // Extract senderId from authenticated user
  const senderId = (socket.request as any).id; // Correct extraction
  if (!senderId) {
    console.error("Sender ID not found. Disconnecting socket.");
    socket.disconnect();
    return;
  }

  // Log the senderId
  console.log(`Sender ID: ${senderId}`);

  // Update user status to online
  prisma.user
    .update({
      where: { id: senderId },
      data: { isOnline: true },
    })
    .then(() => {
      io.emit("updateUserStatus", { userId: senderId, isOnline: true });
    })
    .catch((error) => {
      console.error("Error updating user status to online:", error);
    });


  socket.on("joinRoom", ({ receiverId }) => {
    if (!receiverId) {
      console.error("Receiver ID not provided.");
      return;
    }


    console.log(`Receiver ID passed to joinRoom: ${receiverId}`);


    if (receiverId === senderId) {
      console.error("Receiver ID cannot be the same as Sender ID.");
      return;
    }


    const room = [senderId, receiverId].sort().join("_");
    socket.join(room);
    socket.data.userId = senderId;
    console.log(`User ${senderId} joined room ${room}`);


    io.in(room)
      .fetchSockets()
      .then((sockets) => {
        console.log(`Users in room ${room}:`, sockets.map((s) => s.data.userId));
      });
  });


  socket.on("sendMessage", async ({ receiverId, content }) => {
    if (!receiverId || !content) {
      console.error("Receiver ID or content not provided.");
      return;
    }


    if (receiverId === senderId) {
      console.error("Receiver ID cannot be the same as Sender ID.");
      return;
    }

    try {

      const message = await prisma.message.create({
        data: { senderId, receiverId, content, read: false },
      });
      console.log("Message saved to database:", message);


      const room = [senderId, receiverId].sort().join("_");


      socket.to(room).emit("receiveMessage", message);
      console.log(`Message sent to room ${room}:`, message);


      io.in(room)
        .fetchSockets()
        .then((sockets) => {
          console.log(`Users in room ${room}:`, sockets.map((s) => s.data.userId));
        });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // Disconnect event
  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    if (senderId) {
      try {
        // Update user status to offline
        await prisma.user.update({
          where: { id: senderId },
          data: { isOnline: false },
        });
        io.emit("updateUserStatus", { userId: senderId, isOnline: false });
      } catch (error) {
        console.error("Error updating user status to offline:", error);
      }
    }
  });
});

// Error middleware
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
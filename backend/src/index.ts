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

const app = express();
app.use(express.json());


app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const prisma = new PrismaClient();

app.use("/api/v1/user", userRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/follow", followRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/message", messageRouter);


const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});


io.on("connection", (socket) => {
  console.log("New User Connected: ", socket.id);


  socket.on("joinRoom", ({ senderId, receiverId }) => {
    const room = [senderId, receiverId].sort().join("_");
    socket.join(room);
    socket.data.userId = senderId;
    console.log(`User ${senderId} joined room ${room}`);
  });


  socket.on("userOnline", async (userId: string) => {
    await prisma.user.update({
      where: { id: userId },
      data: { isOnline: true },
    });
    io.emit("updateUserStatus", { userId, isOnline: true });
  });


  socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
    const message = await prisma.message.create({
      data: { senderId, receiverId, content, read: false },
    });

    const room = [senderId, receiverId].sort().join("_");
    io.to(room).emit("receiveMessage", message);
  });


  socket.on("disconnect", async () => {
    if (socket.data.userId) {
      await prisma.user.update({
        where: { id: socket.data.userId },
        data: { isOnline: false },
      });
      io.emit("updateUserStatus", { userId: socket.data.userId, isOnline: false });
    }
    console.log("User disconnected:", socket.id);
  });
});


app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
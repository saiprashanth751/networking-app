import express from "express"
import userRouter from "./routes/user"
import projectRouter from "./routes/project"
import followRouter from "./routes/follow"
import authRouter from "./routes/auth"
import postRouter from "./routes/post"
import messageRouter from "./routes/message"
import { PrismaClient } from "@prisma/client"
import { errorMiddleware } from "./middleware/errorMiddleware";
import { Server } from "socket.io"
import http from "http"
import cors from "cors"

const app = express();
app.use(express.json())
app.use(cors({
  origin: "*", // Replace with your actual frontend domain
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true // Allow cookies if using authentication
}));

const prisma = new PrismaClient()

app.use("/api/v1/user", userRouter)
app.use("/api/v1/project", projectRouter)
app.use("/api/v1/follow", followRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/post", postRouter)
app.use("/api/v1/message", messageRouter)

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
  }
})

io.on("connection", (socket) => {
  console.log("New User Connected: ", socket.id);

  socket.on("joinRoom", ({senderId ,receiverId}: {senderId: string, receiverId: string}) => {
    const room = [senderId, receiverId].sort().join("_");
    socket.join(room);
    console.log(`User ${senderId} joined room ${room}`);
  })
  
  socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
    const message = await prisma.message.create({
        data: { senderId, receiverId, content }
    });

    const room = [senderId, receiverId].sort().join("_")
    io.to(room).emit("receiveMessage", message)
})

socket.on("disconnect", () => {
  console.log("User disconnected:", socket.id)
})

})

app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});






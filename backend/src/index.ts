import express from "express"
import userRouter from "./routes/user"
import projectRouter from "./routes/project"
import followRouter from "./routes/follow"
import authRouter from "./routes/auth"
import postRouter from "./routes/post"
import messageRouter from "./routes/message"
import wss from "./utils/webSocketServer"
import { errorMiddleware } from "./middleware/errorMiddleware";
import cors from "cors"

const app = express();
app.use(express.json())
app.use(cors({
    origin: "*", // Replace with your actual frontend domain
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // Allow cookies if using authentication
  }));

app.use("/api/v1/user",userRouter)
app.use("/api/v1/project",projectRouter)
app.use("/api/v1/follow", followRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/post", postRouter)
app.use("api/v1/message",messageRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket server');
});

app.use(errorMiddleware);



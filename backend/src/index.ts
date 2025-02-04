import express from "express"
import userRouter from "./routes/user"
import projectRouter from "./routes/project"
import followRouter from "./routes/follow"
import { errorMiddleware } from "./middleware/errorMiddleware";
import cors from "cors"

const app = express();
app.use(express.json())
app.use(cors())

app.use("/api/v1/user",userRouter)
app.use("/api/v1/project",projectRouter)
app.use("/api/v1/follow", followRouter)

app.use(errorMiddleware);

app.listen(3000)

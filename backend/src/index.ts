import express from "express"
import userRouter from "./routes/user"
import projectRouter from "./routes/project"
import { errorMiddleware } from "./middleware/errorMiddleware";

const app = express();
app.use(express.json())

app.use("/api/v1/user",userRouter)
app.use("/api/v1/project",projectRouter)


app.use(errorMiddleware);



app.listen(3000)

import express from "express"
import UserRouter from "./routes/user"
import { errorMiddleware } from "./middleware/errorMiddleware";

const app = express();
app.use(express.json())

app.use("/api/v1/user",UserRouter)


app.use(errorMiddleware);



app.listen(3000)

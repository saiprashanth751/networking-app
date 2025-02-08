"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./routes/user"));
const project_1 = __importDefault(require("./routes/project"));
const follow_1 = __importDefault(require("./routes/follow"));
const auth_1 = __importDefault(require("./routes/auth"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "*", // Replace with your actual frontend domain
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // Allow cookies if using authentication
}));
app.use("/api/v1/user", user_1.default);
app.use("/api/v1/project", project_1.default);
app.use("/api/v1/follow", follow_1.default);
app.use("api/v1/auth", auth_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.use(errorMiddleware_1.errorMiddleware);

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./routes/user"));
const follow_1 = __importDefault(require("./routes/follow"));
const auth_1 = __importDefault(require("./routes/auth"));
const post_1 = __importDefault(require("./routes/post"));
const message_1 = __importDefault(require("./routes/message"));
const client_1 = require("@prisma/client");
const path_1 = __importDefault(require("path"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// CORS configuration
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    credentials: true,
}));
const prisma = new client_1.PrismaClient();
// Routes;
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, './uploads')));
app.use("/api/v1/user", user_1.default);
app.use("/api/v1/follow", follow_1.default);
app.use("/api/v1/auth", auth_1.default);
app.use("/api/v1/post", post_1.default);
app.use("/api/v1/message", message_1.default);
// Create HTTP server
const server = http_1.default.createServer(app);
// Socket.IO setup with authentication
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
});
// Authenticate Socket.IO connections
io.use((socket, next) => {
    // Extract token from handshake auth
    const token = socket.handshake.auth.token;
    console.log("token " + token);
    if (!token) {
        return next(new Error("Invalid User / User not logged in"));
    }
    // Attach token to the request object for authMiddleware
    socket.request.headers = { authorization: `Bearer ${token}` };
    // Use your auth middleware
    (0, authMiddleware_1.authMiddleware)(socket.request, {}, (err) => {
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
    const senderId = socket.request.id; // Correct extraction
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
    // Join room event
    socket.on("joinRoom", ({ receiverId }) => {
        if (!receiverId) {
            console.error("Receiver ID not provided.");
            return;
        }
        // Log the receiverId being passed
        console.log(`Receiver ID passed to joinRoom: ${receiverId}`);
        // Validate that receiverId is not the same as senderId
        if (receiverId === senderId) {
            console.error("Receiver ID cannot be the same as Sender ID.");
            return;
        }
        // Create room name (sorted combination of senderId and receiverId)
        const room = [senderId, receiverId].sort().join("_");
        socket.join(room);
        socket.data.userId = senderId;
        console.log(`User ${senderId} joined room ${room}`);
        // Log all users in the room
        io.in(room)
            .fetchSockets()
            .then((sockets) => {
            console.log(`Users in room ${room}:`, sockets.map((s) => s.data.userId));
        });
    });
    // Send message event
    socket.on("sendMessage", (_a) => __awaiter(void 0, [_a], void 0, function* ({ receiverId, content }) {
        if (!receiverId || !content) {
            console.error("Receiver ID or content not provided.");
            return;
        }
        // Validate that receiverId is not the same as senderId
        if (receiverId === senderId) {
            console.error("Receiver ID cannot be the same as Sender ID.");
            return;
        }
        try {
            // Save message to the database
            const message = yield prisma.message.create({
                data: { senderId, receiverId, content, read: false },
            });
            console.log("Message saved to database:", message);
            // Create room name (sorted combination of senderId and receiverId)
            const room = [senderId, receiverId].sort().join("_");
            // Emit the message to the room (excluding the sender)
            socket.to(room).emit("receiveMessage", message);
            console.log(`Message sent to room ${room}:`, message);
            // Log all users in the room
            io.in(room)
                .fetchSockets()
                .then((sockets) => {
                console.log(`Users in room ${room}:`, sockets.map((s) => s.data.userId));
            });
        }
        catch (error) {
            console.error("Error sending message:", error);
        }
    }));
    // Disconnect event
    socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("User disconnected:", socket.id);
        if (senderId) {
            try {
                // Update user status to offline
                yield prisma.user.update({
                    where: { id: senderId },
                    data: { isOnline: false },
                });
                io.emit("updateUserStatus", { userId: senderId, isOnline: false });
            }
            catch (error) {
                console.error("Error updating user status to offline:", error);
            }
        }
    }));
});
// Error middleware
app.use(errorMiddleware_1.errorMiddleware);
// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

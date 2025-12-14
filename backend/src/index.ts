import express from "express";
import userRouter from "./routes/user";
import followRouter from "./routes/follow";
import authRouter from "./routes/auth";
import postRouter from "./routes/post";
import messageRouter from "./routes/message";
import projectRouter from "./routes/project"
import conversationRouter from "./routes/conversation";
import callHistoryRouter from "./routes/callHistory";
import prisma from "../prisma/prisma_client";
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
    origin: process.env.ORIGIN_URL,
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

// Routes;
app.use('/uploads', express.static(path.join(__dirname, './uploads')));
app.use("/api/v1/user", userRouter);
app.use("/api/v1/follow", followRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/conversation", conversationRouter);
app.use("/api/v1/callhistory", callHistoryRouter);

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup with authentication
const io = new Server(server, {
  cors: {
    origin: process.env.ORIGIN_URL,
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

  socket.on("callInitiate", async ({ receiverId, callType }: { 
  receiverId: string; 
  callType: 'audio' | 'video' 
}) => {
  console.log(`[CALL] ${senderId} initiating ${callType} call to ${receiverId}`);

  if (!receiverId || receiverId === senderId) {
    console.error("[CALL] Invalid receiver ID");
    return;
  }

  try {
    // Fetch caller details for notification
    const caller = await prisma.user.findUnique({
      where: { id: senderId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profile: {
          select: { profilePic: true }
        }
      }
    });

    if (!caller) {
      console.error("[CALL] Caller not found");
      return;
    }

    // Create call room
    const room = [senderId, receiverId].sort().join("_");

    // Create initial call history record
    const callRecord = await prisma.callHistory.create({
      data: {
        callerId: senderId,
        receiverId: receiverId,
        type: callType,
        status: "no-answer", // Default status
        startedAt: new Date()
      }
    });

    console.log(`[CALL] Call record created: ${callRecord.id}`);

    // Notify receiver about incoming call
    io.to(receiverId).emit("incomingCall", {
      callId: callRecord.id,
      callerId: senderId,
      callerName: `${caller.firstName} ${caller.lastName || ''}`.trim(),
      callerAvatar: caller.profile?.profilePic || null,
      callType,
      room
    });

    // Notify caller that call is ringing
    socket.emit("callRinging", { callId: callRecord.id, room });

    console.log(`[CALL] Incoming call notification sent to ${receiverId}`);

  } catch (error) {
    console.error("[CALL] Error initiating call:", error);
    socket.emit("callError", { message: "Failed to initiate call" });
  }
});

// 2. CALL ACCEPTANCE
socket.on("callAccept", async ({ callId, callerId }: { 
  callId: string; 
  callerId: string 
}) => {
  console.log(`[CALL] ${senderId} accepted call ${callId} from ${callerId}`);

  try {
    // Update call status to "in progress"
    await prisma.callHistory.update({
      where: { id: callId },
      data: { 
        status: "completed", // Will be updated to actual duration on end
        startedAt: new Date() // Reset to actual start time
      }
    });

    const room = [senderId, callerId].sort().join("_");

    // Notify caller that call was accepted
    io.to(callerId).emit("callAccepted", { 
      callId, 
      room,
      receiverId: senderId 
    });

    console.log(`[CALL] Call ${callId} accepted, both parties notified`);

  } catch (error) {
    console.error("[CALL] Error accepting call:", error);
    socket.emit("callError", { message: "Failed to accept call" });
  }
});

// 3. CALL REJECTION
socket.on("callReject", async ({ callId, callerId }: { 
  callId: string; 
  callerId: string 
}) => {
  console.log(`[CALL] ${senderId} rejected call ${callId} from ${callerId}`);

  try {
    // Update call status to declined
    await prisma.callHistory.update({
      where: { id: callId },
      data: { 
        status: "declined",
        endedAt: new Date()
      }
    });

    // Notify caller that call was rejected
    io.to(callerId).emit("callRejected", { callId });

    console.log(`[CALL] Call ${callId} rejected`);

  } catch (error) {
    console.error("[CALL] Error rejecting call:", error);
  }
});

// 4. CALL END
socket.on("callEnd", async ({ callId, otherUserId, duration }: { 
  callId: string; 
  otherUserId: string; 
  duration: number 
}) => {
  console.log(`[CALL] ${senderId} ending call ${callId}, duration: ${duration}s`);

  try {
    // Update call history with final duration
    await prisma.callHistory.update({
      where: { id: callId },
      data: {
        status: duration > 0 ? "completed" : "no-answer",
        duration: duration,
        endedAt: new Date()
      }
    });

    // Notify other user that call ended
    io.to(otherUserId).emit("callEnded", { callId });

    console.log(`[CALL] Call ${callId} ended successfully`);

  } catch (error) {
    console.error("[CALL] Error ending call:", error);
  }
});

// 5. CALL TIMEOUT (No answer after 30 seconds)
socket.on("callTimeout", async ({ callId, receiverId }: { 
  callId: string; 
  receiverId: string 
}) => {
  console.log(`[CALL] Call ${callId} timed out (no answer)`);

  try {
    await prisma.callHistory.update({
      where: { id: callId },
      data: { 
        status: "no-answer",
        endedAt: new Date()
      }
    });

    // Notify receiver that caller cancelled
    io.to(receiverId).emit("callCancelled", { callId });

  } catch (error) {
    console.error("[CALL] Error handling timeout:", error);
  }
});

// ============================================
// WEBRTC SIGNALING (Peer-to-Peer Connection)
// ============================================

// WebRTC Offer (Caller -> Receiver)
socket.on("webrtc-offer", ({ receiverId, offer }: { 
  receiverId: string; 
  offer: any 
}) => {
  console.log(`[WEBRTC] Forwarding offer from ${senderId} to ${receiverId}`);
  
  io.to(receiverId).emit("webrtc-offer", { 
    offer, 
    senderId 
  });
});

// WebRTC Answer (Receiver -> Caller)
socket.on("webrtc-answer", ({ callerId, answer }: { 
  callerId: string; 
  answer: any 
}) => {
  console.log(`[WEBRTC] Forwarding answer from ${senderId} to ${callerId}`);
  
  io.to(callerId).emit("webrtc-answer", { 
    answer,
    senderId 
  });
});

// ICE Candidate Exchange (Both directions)
socket.on("webrtc-ice-candidate", ({ otherUserId, candidate }: { 
  otherUserId: string; 
  candidate: any 
}) => {
  console.log(`[WEBRTC] Forwarding ICE candidate from ${senderId} to ${otherUserId}`);
  
  io.to(otherUserId).emit("webrtc-ice-candidate", { 
    candidate,
    senderId 
  });
});

// Connection established confirmation
socket.on("webrtc-connected", ({ otherUserId }: { otherUserId: string }) => {
  console.log(`[WEBRTC] Connection established between ${senderId} and ${otherUserId}`);
  
  io.to(otherUserId).emit("webrtc-connected", { senderId });
});

// Connection failed
socket.on("webrtc-failed", ({ otherUserId, reason }: { 
  otherUserId: string; 
  reason: string 
}) => {
  console.log(`[WEBRTC] Connection failed: ${reason}`);
  
  io.to(otherUserId).emit("webrtc-failed", { 
    senderId,
    reason 
  });
});

  // Disconnect event
  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    if (senderId) {
      try {
        // Update user status to offline AND set lastSeen
        await prisma.user.update({
          where: { id: senderId },
          data: {
            isOnline: false,
            lastSeen: new Date()  // ADD THIS LINE
          },
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
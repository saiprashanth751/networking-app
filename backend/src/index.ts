import express from "express";
import userRouter from "./routes/user";
import followRouter from "./routes/follow";
import authRouter from "./routes/auth";
import postRouter from "./routes/post";
import messageRouter from "./routes/message";
import projectRouter from "./routes/project"
import conversationRouter from "./routes/conversation";
import callHistoryRouter from "./routes/callHistory";
import categoryRouter from "./routes/category";
import tagRouter from "./routes/tag";
import draftRouter from "./routes/draft";
import engagementRouter from "./routes/engagement";
import mediaRouter from "./routes/media";
import searchRouter from "./routes/search";
import trendingRouter from "./routes/trending";
import prisma from "../prisma/prisma_client";
import path from "path";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import { authMiddleware } from "./middleware/authMiddleware";
import { v2 as cloudinary } from 'cloudinary';
import { createCallLogger } from "./utils/callLogger";

const logger = createCallLogger({ file: 'index.ts' });


const app = express();
app.use(
  cors({
    origin: [
      process.env.ORIGIN_URL || 'http://localhost:5173',
      'http://10.203.232.89:5173'
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
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

// Routes
app.use('/uploads', express.static(path.join(__dirname, './uploads')));
app.use("/api/v1/user", userRouter);
app.use("/api/v1/follow", followRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/project", projectRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/conversation", conversationRouter);
app.use("/api/v1/callhistory", callHistoryRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/tag", tagRouter);
app.use("/api/v1/draft", draftRouter);
app.use("/api/v1/engagement", engagementRouter);
app.use("/api/v1/media", mediaRouter);
app.use("/api/v1/search", searchRouter);
app.use("/api/v1/trending", trendingRouter);

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

//FIX: Track active call states for idempotency
const activeCallStates = new Map<string, {
  callId: string;
  state: 'ringing' | 'active';
  callerId: string;
  receiverId: string;
  timeout?: NodeJS.Timeout;
}>();

// Authenticate Socket.IO connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  console.log("token " + token)
  if (!token) {
    return next(new Error("Invalid User / User not logged in"));
  }

  socket.request.headers = {
    ...(socket.request.headers || {}),
    authorization: `Bearer ${token}`
  };


  authMiddleware(socket.request as express.Request, {} as any, (err?: any) => {
    if (err) {
      return next(new Error("Authentication failed"));
    }
    next();
  });
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  logger.info('SOCKET: New connection', { socketId: socket.id });
  console.log("New User Connected:", socket.id);

  const senderId = (socket.request as any).id;
  if (!senderId) {
    console.error("Sender ID not found. Disconnecting socket.");
    socket.disconnect();
    return;
  }

  console.log(`Sender ID: ${senderId}`);

  //FIX #1: Auto-join user to their OWN room (Critical for call notifications)
  socket.join(senderId);
  console.log(`✅ User ${senderId} joined their personal room`);

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

  // ============================================
  // CALL SIGNALING (With Fixes)
  // ============================================

  socket.on("callInitiate", async ({ receiverId, callType }: {
    receiverId: string;
    callType: 'audio' | 'video'
  }) => {
    console.log(`[CALL] ${senderId} initiating ${callType} call to ${receiverId}`);

    if (!receiverId || receiverId === senderId) {
      logger.error('Invalid receiver ID', { receiverId, senderId });
      console.error("[CALL] Invalid receiver ID");
      return;
    }

    try {
      //FIX #3: Check if receiver is online FIRST
      const receiverSockets = await io.in(receiverId).fetchSockets();
      if (receiverSockets.length === 0) {
        logger.warn('Receiver is offline', { receiverId });
        console.log(`[CALL] Receiver ${receiverId} is offline`);
        socket.emit("callUnavailable", {
          receiverId,
          reason: "User is offline"
        });
        return;
      }

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
        logger.error('Caller not found in database', { senderId });
        console.error("[CALL] Caller not found");
        return;
      }

      const room = [senderId, receiverId].sort().join("_");

      //  FIX: Create call history AFTER confirming receiver is online
      const callRecord = await prisma.callHistory.create({
        data: {
          callerId: senderId,
          receiverId: receiverId,
          type: callType,
          status: "no-answer",
          startedAt: new Date()
        }
      });

      logger.info('Call record created', { callId: callRecord.id, callerId: senderId, receiverId, callType });
      console.log(`[CALL] Call record created: ${callRecord.id}`);

      // Store call state for idempotency
      activeCallStates.set(callRecord.id, {
        callId: callRecord.id,
        state: 'ringing',
        callerId: senderId,
        receiverId: receiverId
      });

      logger.info('SOCKET EMIT: incomingCall', { callId: callRecord.id, receiverId, callerName: `${caller.firstName} ${caller.lastName || ''}`.trim() });
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

      //  FIX #2: Backend-controlled timeout (30 seconds)
      const timeoutTimer = setTimeout(async () => {
        const callState = activeCallStates.get(callRecord.id);

        // Only timeout if still in ringing state
        if (callState && callState.state === 'ringing') {
          console.log(`[CALL] Backend timeout: Call ${callRecord.id} not answered`);

          try {
            await prisma.callHistory.update({
              where: { id: callRecord.id },
              data: {
                status: "no-answer",
                endedAt: new Date()
              }
            });

            // Notify both parties
            io.to(senderId).emit("callTimeout", { callId: callRecord.id });
            io.to(receiverId).emit("callCancelled", { callId: callRecord.id });

            activeCallStates.delete(callRecord.id);
          } catch (error) {
            console.error("[CALL] Error handling timeout:", error);
          }
        }
      }, 31000); // 30 seconds

      // Store timeout handle
      const state = activeCallStates.get(callRecord.id);
      if (state) {
        state.timeout = timeoutTimer;
      }

    } catch (error) {
      console.error("[CALL] Error initiating call:", error);
      socket.emit("callError", { message: "Failed to initiate call" });
    }
  });

  // CALL ACCEPTANCE
  socket.on("callAccept", async ({ callId, callerId }: {
    callId: string;
    callerId: string
  }) => {
    logger.info('SOCKET RECEIVE: callAccept', { senderId, callId, callerId });
    console.log(`[CALL] ${senderId} accepting call ${callId} from ${callerId}`);

    try {
      //  FIX #4: Idempotency guard - only accept if ringing
      const callState = activeCallStates.get(callId);
      if (!callState || callState.state !== 'ringing') {
        logger.warn('Call already accepted or invalid', { callId, currentState: callState?.state });
        console.log(`[CALL] Call ${callId} already accepted or invalid`);
        return;
      }

      // Clear timeout
      if (callState.timeout) {
        clearTimeout(callState.timeout);
      }

      // Update state to active
      callState.state = 'active';

      await prisma.callHistory.update({
        where: { id: callId },
        data: {
          status: "completed", //change it to active, completed is confusing
          startedAt: new Date()
        }
      });

      const room = [senderId, callerId].sort().join("_");

      logger.info('SOCKET EMIT: callAccepted', { callId, callerId, receiverId: senderId });
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

  // CALL REJECTION
  socket.on("callReject", async ({ callId, callerId }: {
    callId: string;
    callerId: string
  }) => {
    console.log(`[CALL] ${senderId} rejecting call ${callId} from ${callerId}`);

    try {
      const callState = activeCallStates.get(callId);
      if (callState?.timeout) {
        clearTimeout(callState.timeout);
      }

      await prisma.callHistory.update({
        where: { id: callId },
        data: {
          status: "declined",
          endedAt: new Date()
        }
      });

      logger.info('SOCKET EMIT: callRejected', { callId, callerId });
      io.to(callerId).emit("callRejected", { callId });
      activeCallStates.delete(callId);

      console.log(`[CALL] Call ${callId} rejected`);

    } catch (error) {
      console.error("[CALL] Error rejecting call:", error);
    }
  });

  // CALL END
  socket.on("callEnd", async ({ callId, otherUserId, duration }: {
    callId: string;
    otherUserId: string;
    duration: number
  }) => {
    logger.info('SOCKET RECEIVE: callEnd', { senderId, callId, otherUserId, duration });
    console.log(`[CALL] ${senderId} ending call ${callId}, duration: ${duration}s`);

    try {
      //  FIX #4: Idempotency guard - only end if active
      const callState = activeCallStates.get(callId);
      if (!callState) {
        logger.warn('Call already ended or invalid', { callId });
        console.log(`[CALL] Call ${callId} already ended or invalid`);
        return;
      }

      if (callState.timeout) {
        clearTimeout(callState.timeout);
      }

      await prisma.callHistory.update({
        where: { id: callId },
        data: {
          status: duration > 0 ? "completed" : "no-answer",
          duration: duration,
          endedAt: new Date()
        }
      });

      logger.info('SOCKET EMIT: callEnded', { callId, otherUserId });
      io.to(otherUserId).emit("callEnded", { callId });
      activeCallStates.delete(callId);

      console.log(`[CALL] Call ${callId} ended successfully`);

    } catch (error) {
      console.error("[CALL] Error ending call:", error);
    }
  });

  // CALL TIMEOUT (Frontend fallback - backend is authority)
  socket.on("callTimeout", async ({ callId, receiverId }: {
    callId: string;
    receiverId: string
  }) => {
    logger.info('SOCKET RECEIVE: callTimeout', { senderId, callId, receiverId });
    console.log(`[CALL] Frontend timeout signal for ${callId}`);

    try {
      const callState = activeCallStates.get(callId);
      if (!callState) return;

      if (callState.timeout) {
        clearTimeout(callState.timeout);
      }

      await prisma.callHistory.update({
        where: { id: callId },
        data: {
          status: "no-answer",
          endedAt: new Date()
        }
      });

      logger.info('SOCKET EMIT: callCancelled', { callId, receiverId });
      io.to(receiverId).emit("callCancelled", { callId });
      activeCallStates.delete(callId);

    } catch (error) {
      console.error("[CALL] Error handling timeout:", error);
    }
  });

  // ============================================
  // WEBRTC SIGNALING
  // ============================================

  socket.on("webrtc-offer", ({ receiverId, offer }: {
    receiverId: string;
    offer: any
  }) => {
    logger.info('SOCKET RECEIVE: webrtc-offer', { senderId, receiverId });
    console.log(`[WEBRTC] Forwarding offer from ${senderId} to ${receiverId}`);
    logger.info('SOCKET EMIT: webrtc-offer', { senderId, receiverId });
    io.to(receiverId).emit("webrtc-offer", { offer, senderId });
  });

  socket.on("webrtc-answer", ({ callerId, answer }: {
    callerId: string;
    answer: any
  }) => {
    logger.info('SOCKET RECEIVE: webrtc-answer', { senderId, callerId });
    console.log(`[WEBRTC] Forwarding answer from ${senderId} to ${callerId}`);
    logger.info('SOCKET EMIT: webrtc-answer', { senderId, callerId });
    io.to(callerId).emit("webrtc-answer", { answer, senderId });
  });

  socket.on("webrtc-ice-candidate", ({ otherUserId, candidate }: {
    otherUserId: string;
    candidate: any
  }) => {
    logger.info('SOCKET RECEIVE: webrtc-ice-candidate', { senderId, otherUserId });
    console.log(`[WEBRTC] Forwarding ICE candidate from ${senderId} to ${otherUserId}`);
    logger.info('SOCKET EMIT: webrtc-ice-candidate', { senderId, otherUserId });
    io.to(otherUserId).emit("webrtc-ice-candidate", { candidate, senderId });
  });

  socket.on("webrtc-connected", ({ otherUserId }: { otherUserId: string }) => {
    console.log(`[WEBRTC] Connection established between ${senderId} and ${otherUserId}`);
    io.to(otherUserId).emit("webrtc-connected", { senderId });
  });

  socket.on("webrtc-failed", ({ otherUserId, reason }: {
    otherUserId: string;
    reason: string
  }) => {
    console.log(`[WEBRTC] Connection failed: ${reason}`);
    io.to(otherUserId).emit("webrtc-failed", { senderId, reason });
  });

  // Disconnect event
  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);

    if (senderId) {
      try {
        await prisma.user.update({
          where: { id: senderId },
          data: {
            isOnline: false,
            lastSeen: new Date()
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
const PORT = parseInt(process.env.PORT || '3000', 10);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  logger.info(`Server is running on port ${PORT}`)
});
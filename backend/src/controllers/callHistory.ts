import { Request, Response } from "express";
import prisma from "../../prisma/prisma_client";
import { createCallLogger } from "../utils/callLogger";

const logger = createCallLogger({ file: 'controllers/callHistory.ts' });

export const getCallHistory = async (req: any, res: Response) => {
  logger.info('→ getCallHistory()', { userId: req.id });
  try {
    const userId = req.id;

    const calls = await prisma.callHistory.findMany({
      where: {
        OR: [
          { callerId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        caller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                profilePic: true
              }
            }
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                profilePic: true
              }
            }
          }
        }
      },
      orderBy: {
        startedAt: "desc"
      },
      take: 50 // Last 50 calls
    });

    // Format response
    const formattedCalls = calls.map(call => {
      const isIncoming = call.receiverId === userId;
      const otherUser = isIncoming ? call.caller : call.receiver;

      return {
        id: call.id,
        type: call.type,
        status: call.status,
        duration: call.duration,
        startedAt: call.startedAt,
        endedAt: call.endedAt,
        isIncoming,
        otherUser: {
          id: otherUser.id,
          name: `${otherUser.firstName} ${otherUser.lastName || ''}`.trim(),
          avatar: otherUser.profile?.profilePic || null
        }
      };
    });

    res.json({
      success: true,
      calls: formattedCalls
    });

  } catch (error) {
    console.error("Error fetching call history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch call history"
    });
  }
};

export const getUserCallHistory = async (req: any, res: Response) => {
  try {
    const currentUserId = req.id;
    const { userId } = req.params;

    const calls = await prisma.callHistory.findMany({
      where: {
        OR: [
          { callerId: currentUserId, receiverId: userId },
          { callerId: userId, receiverId: currentUserId }
        ]
      },
      orderBy: {
        startedAt: "desc"
      },
      take: 20
    });

    const formattedCalls = calls.map(call => ({
      id: call.id,
      type: call.type,
      status: call.status,
      duration: call.duration,
      startedAt: call.startedAt,
      isIncoming: call.receiverId === currentUserId
    }));

    res.json({
      success: true,
      calls: formattedCalls
    });

  } catch (error) {
    console.error("Error fetching user call history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch call history"
    });
  }
};

export const deleteCallHistory = async (req: any, res: Response) => {
  try {
    const userId = req.id;
    const { callId } = req.params;

    // Verify user is part of this call
    const call = await prisma.callHistory.findFirst({
      where: {
        id: callId,
        OR: [
          { callerId: userId },
          { receiverId: userId }
        ]
      }
    });

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found"
      });
    }

    // Delete call record
    await prisma.callHistory.delete({
      where: { id: callId }
    });

    res.json({
      success: true,
      message: "Call history deleted"
    });

  } catch (error) {
    console.error("Error deleting call history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete call history"
    });
  }
};
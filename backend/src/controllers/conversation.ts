// backend/controllers/conversation.ts
import { asyncHandler } from "../middleware/asyncHandler";
import { Request, Response } from "express";
import CustomError from "../utils/customError";
import prisma from "../../prisma/prisma_client";

interface AuthRequest extends Request { 
    id?: string
}

// Get all conversations for current user
export const getConversations = asyncHandler(async(req: AuthRequest, res: Response) => {
    const userId = req.id as string;
    
    if (!userId) {
        throw new CustomError("User ID is missing", 400);
    }
    
    // Fetch conversations where user is participant
    const conversations = await prisma.conversation.findMany({
        where: {
            OR: [
                { user1Id: userId },
                { user2Id: userId }
            ]
        },
        orderBy: {
            lastMessageAt: 'desc'
        }
    });
    
    // Enrich with other user's data
    const enriched = await Promise.all(
        conversations.map(async (conv) => {
            const otherUserId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
            const unreadCount = conv.user1Id === userId ? conv.user1UnreadCount : conv.user2UnreadCount;
            
            const otherUser = await prisma.user.findUnique({
                where: { id: otherUserId },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    isOnline: true,
                    lastSeen: true,
                    profile: {
                        select: {
                            profilePic: true
                        }
                    }
                }
            });
            
            return {
                id: conv.id,
                otherUser,
                lastMessage: {
                    content: conv.lastMessageContent,
                    timestamp: conv.lastMessageAt
                },
                unreadCount,
                lastMessageAt: conv.lastMessageAt
            };
        })
    );
    
    res.status(200).json({
        conversations: enriched
    });
});

// Get or create conversation between two users
export const getOrCreateConversation = asyncHandler(async(req: AuthRequest, res: Response) => {
    const userId = req.id as string;
    const otherUserId = req.params.userId;
    
    if (!userId || !otherUserId) {
        throw new CustomError("Missing user IDs", 400);
    }
    
    // Ensure consistent ordering
    const [user1Id, user2Id] = [userId, otherUserId].sort();
    
    // Find or create conversation
    let conversation = await prisma.conversation.findUnique({
        where: {
            user1Id_user2Id: {
                user1Id,
                user2Id
            }
        }
    });
    
    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                user1Id,
                user2Id
            }
        });
    }
    
    res.status(200).json({
        conversation
    });
});

// Get unread message count across all conversations
export const getUnreadCount = asyncHandler(async(req: AuthRequest, res: Response) => {
    const userId = req.id as string;
    
    const conversations = await prisma.conversation.findMany({
        where: {
            OR: [
                { user1Id: userId },
                { user2Id: userId }
            ]
        },
        select: {
            user1Id: true,
            user1UnreadCount: true,
            user2UnreadCount: true
        }
    });
    
    const totalUnread = conversations.reduce((sum, conv) => {
        return sum + (conv.user1Id === userId ? conv.user1UnreadCount : conv.user2UnreadCount);
    }, 0);
    
    res.status(200).json({
        unreadCount: totalUnread
    });
});

// Search conversations
export const searchConversations = asyncHandler(async(req: AuthRequest, res: Response) => {
    const userId = req.id as string;
    const query = req.query.q as string;
    
    if (!query || query.trim().length < 2) {
        return res.status(200).json({ users: [] });
    }
    
    // Search users (not conversations)
    const users = await prisma.user.findMany({
        where: {
            AND: [
                { id: { not: userId } }, // Exclude self
                {
                    OR: [
                        { firstName: { contains: query, mode: 'insensitive' } },
                        { lastName: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } }
                    ]
                }
            ]
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            isOnline: true,
            profile: {
                select: {
                    profilePic: true,
                    department: true
                }
            }
        },
        take: 10
    });
    
    res.status(200).json({ users });
});
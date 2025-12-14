import { asyncHandler } from "../middleware/asyncHandler";
import { Request, Response } from "express";
import { MessageBody } from "../types/types";
import CustomError from "../utils/customError";
import prisma from "../../prisma/prisma_client";

interface AuthRequest extends Request { 
    id?: string
}

export const sendMessage = asyncHandler(async(req: AuthRequest, res: Response) => {
    const { success } = MessageBody.safeParse(req.body);
    if (!success) {
        throw new CustomError("Invalid input", 400);
    }
    
    const userId = req.id as string;
    const { receiverId, content, mediaUrl, mediaType, fileName, fileSize } = req.body;
    
    if (!userId) {
        throw new CustomError("User ID is missing", 400);
    }
    
    // Create message
    const msg = await prisma.message.create({
        data: {
            senderId: userId,
            receiverId,
            content,
            mediaUrl,
            mediaType,
            fileName,
            fileSize
        }
    });
    
    // Update or create conversation
    const [user1Id, user2Id] = [userId, receiverId].sort();
    
    await prisma.conversation.upsert({
        where: {
            user1Id_user2Id: { user1Id, user2Id }
        },
        create: {
            user1Id,
            user2Id,
            lastMessageContent: content.substring(0, 100),
            lastMessageAt: msg.timestamp,
            user1UnreadCount: user1Id === receiverId ? 1 : 0,
            user2UnreadCount: user2Id === receiverId ? 1 : 0
        },
        update: {
            lastMessageContent: content.substring(0, 100),
            lastMessageAt: msg.timestamp,
            ...(user1Id === receiverId 
                ? { user1UnreadCount: { increment: 1 } }
                : { user2UnreadCount: { increment: 1 } }
            )
        }
    });
    
    return res.status(200).json({
        message: "Message sent",
        msg
    });
});


export const getMessages = asyncHandler(async(req:AuthRequest,  res:Response ) => {

    const id = req.id as string;
    const receiverId = req.params.id

    if (!id) {
        throw new CustomError("User ID is missing", 400);
    }

    const messages = await prisma.message.findMany({
        where: {
            OR : [ 
                {senderId: id, receiverId},
                {senderId: receiverId, receiverId: id}
            ]
        },
        orderBy: {
            timestamp: "asc"
        }
    })

    return res.status(200).json({
        messages
    })
})

export const markMessagesAsRead = asyncHandler(async(req: AuthRequest, res: Response) => {
    const userId = req.id;
    const senderId = req.params.id;
    
    // Mark messages as read
    await prisma.message.updateMany({
        where: {
            senderId,
            receiverId: userId,
            read: false
        },
        data: {
            read: true,
            readAt: new Date()
        }
    });
    
    // Reset unread count in conversation
    const [user1Id, user2Id] = [userId!, senderId].sort();
    
    await prisma.conversation.update({
        where: {
            user1Id_user2Id: { user1Id, user2Id }
        },
        data: {
            ...(user1Id === userId
                ? { user1UnreadCount: 0 }
                : { user2UnreadCount: 0 }
            )
        }
    });
    
    res.status(200).json({
        message: "Messages marked as read"
    });
});

export const getMessagesPaginated = asyncHandler(async(req: AuthRequest, res: Response) => {
    const userId = req.id as string;
    const otherUserId = req.params.id;
    const cursor = req.query.cursor as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ],
            deleted: false
        },
        orderBy: {
            timestamp: 'desc'
        },
        take: limit + 1, // Fetch one extra to check if there's more
        ...(cursor && {
            cursor: { id: cursor },
            skip: 1 // Skip the cursor itself
        })
    });
    
    const hasMore = messages.length > limit;
    const data = hasMore ? messages.slice(0, -1) : messages;
    
    res.status(200).json({
        messages: data.reverse(), // Reverse to show oldest first
        nextCursor: hasMore ? data[data.length - 1].id : null,
        hasMore
    });
});

// Add this to backend/controllers/message.ts

export const uploadMessageFile = asyncHandler(async(req: AuthRequest, res: Response) => {
    const userId = req.id as string;
    
    if (!userId) {
        throw new CustomError("User ID is missing", 400);
    }
    
    if (!req.file) {
        throw new CustomError("No file uploaded", 400);
    }
    
    const file = req.file as any; // Has cloudinaryUrl from middleware
    const mediaUrl = file.cloudinaryUrl;
    
    // Determine media type
    let mediaType = 'document';
    if (file.mimetype.startsWith('image/')) {
        mediaType = 'image';
    } else if (file.mimetype.startsWith('video/')) {
        mediaType = 'video';
    }
    
    res.status(200).json({
        mediaUrl,
        mediaType,
        fileName: file.originalname,
        fileSize: file.size
    });
});
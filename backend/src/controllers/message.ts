import { asyncHandler } from "../middleware/asyncHandler";
import { Request, Response } from "express";
import { MessageBody } from "../types/types";
import CustomError from "../utils/customError";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

interface AuthRequest extends Request { 
    id?: string
}

export const sendMessage = asyncHandler(async(req:AuthRequest,  res:Response ) => {
    const {success} = MessageBody.safeParse(req.body);
    if(!success){
        new CustomError("Invalid input", 400);
    }
    const id = req.id as string;

    if (!id) {
        throw new CustomError("User ID is missing", 400);
    }

    const {receiverId, content} = req.body

    const message = await prisma.message.create({
        data: {
            senderId: id,
            receiverId,
            content
        }
    })

    return res.status(200).json({
        mes: "Message Sent",
        message
    })
})


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
        mes: "Message Sent",
        messages
    })
})
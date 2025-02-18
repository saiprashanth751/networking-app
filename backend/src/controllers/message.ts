import { asyncHandler } from "../middleware/asyncHandler";
import { Request, Response } from "express";
import { MessageBody } from "../types/types";
import CustomError from "../utils/customError";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

interface AuthRequest extends Request { 
    id?: string
}

export const createMessage = asyncHandler(async(req:AuthRequest,  res:Response ) => {
    const {success} = MessageBody.safeParse(req.body);
    if(!success){
        new CustomError("Invalid input", 400);
    }
    const id = req.id as string;

    if (!id) {
        throw new CustomError("User ID is missing", 400);
    }

    const {receiverID, content} = req.body

    const message = await prisma.message.create({
        data: {
            senderID: id,
            receiverID,
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
    const receiverID = req.params.id

    if (!id) {
        throw new CustomError("User ID is missing", 400);
    }

    const messages = await prisma.message.findMany({
        where: {
            OR : [ 
                {senderID: id,receiverID},
                {senderID: receiverID, receiverID: id}
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
import { asyncHandler } from "../middleware/asyncHandler";
import { Request, Response } from "express";
import { ProjectBody } from "../types/types";
import CustomError from "../utils/customError";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

interface AuthRequest extends Request{
    id?:string
}

export const createProject = asyncHandler(async (req:AuthRequest, res: Response) => {
    const {success} = ProjectBody.safeParse(req.body)
    if(!success){
        throw new CustomError("Invalid data input", 400)
    }

    const userId= req.id
    const {title, description} = req.body
    const project = await prisma.project.create({
        data: {
            title,
            description,
            user: {
                connect: {
                    id: userId
                }
            }
        }
    })

    return res.status(200).json({
        message: "Project successfully created",
        project
    })

})


export const updateProject = asyncHandler(async (req:AuthRequest, res: Response) => {
    const {success} = ProjectBody.safeParse(req.body)
    if(!success){
        throw new CustomError("Invalid data input", 400)
    }

    const userId= req.id
    const {title, description} = req.body
    const project = await prisma.project.update({
        where: {
            userId
        },
        data: {
            title,
            description,
        }
    })

    return res.status(200).json({
        message: "Project updated successfully",
        project
    })

})

export const getProjects = asyncHandler(async (req:AuthRequest, res: Response) => {
    const {success} = ProjectBody.safeParse(req.body)
    if(!success){
        throw new CustomError("Invalid data input", 400)
    }

    const userId= req.id
    const projects = await prisma.project.findMany({
        where: {
            userId
        }
    })

    return res.status(200).json({
        projects
    })

})


export const deleteProject = asyncHandler(async (req:AuthRequest, res: Response) => {
    const {success} = ProjectBody.safeParse(req.body)
    if(!success){
        throw new CustomError("Invalid data input", 400)
    }
    const id = req.id
    const userId= req.id
    await prisma.project.delete({
        where: {
            id,
            userId
        }
    })

    return res.status(200).json({
        message: "Project successfully deleted"
    })

})


import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import { asyncHandler } from "../middleware/asyncHandler"
import jwt from "jsonwebtoken"
import CustomError from "../utils/customError"
import bcrypt from "bcrypt"
import { profileCreation, signinBody, signupBody } from "../types/types"


const prisma = new PrismaClient()

export const userSignup = asyncHandler(async (req:Request, res:Response) => {
    const {success} = signupBody.safeParse(req.body);
    if(!success){
        throw new CustomError("Invalid input", 403)
    }

    const {firstName, lastName, email, password} = req.body
    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    })
    
    if(existingUser){
        throw new CustomError("User already exists", 409)
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashedPassword
        }
    })
    if (!process.env.JWT_SECRET) {
        throw new CustomError("JWT_SECRET is not defined", 500);
    }
    const token = jwt.sign({id: user.id}, process.env.JWT_SECRET);

    return res.status(200).json({
        message: "User created successfully",
        token
    })
})

export const userSignin = asyncHandler(async (req:Request, res:Response) => {
    const {success} = signinBody.safeParse(req.body);
    if(!success){
        throw new CustomError("Invalid input", 403)
    }

    const {email, password} = req.body
    const user = await prisma.user.findUnique({
        where: {
            email
        }
    })

    if(!user){
        throw new CustomError("User does not exist", 400)
    }

    const passwordVerification = await bcrypt.compare(password,user.password);

    if(!passwordVerification){
        throw new CustomError("Incorrect Password", 400);
    }
    if (!process.env.JWT_SECRET) {
        throw new CustomError("JWT_SECRET is not defined", 500);
    }
    const token = jwt.sign({id: user.id}, process.env.JWT_SECRET);
    return res.status(200).json({
        message: "Sign in successfull",
        token
    })
    
})

interface AuthRequest extends Request{
    id?: string
}

export const userProfile = asyncHandler(async (req:AuthRequest, res:Response) => {
    const {success} = profileCreation.safeParse(req.body)
    if(!success){
        throw new CustomError("Invalid input data", 400)
    }
    const userId = req.id

    const existingProfile = await prisma.profile.findUnique({
        where: {
            userId
        }
    })

    if(existingProfile){
        throw new CustomError("Profile already created. Only updates are available after creation",400)
    }

    const {bio, profilePic, department, graduationYear, minor, linkedin, github} = req.body
    
    const profile = prisma.profile.create({
        data: {
            bio,
            profilePic,
            department,
            graduationYear,
            minor,
            linkedin,
            github,
            user: {
                connect: {
                    id: userId
                }
            }
        }
    })
     
})
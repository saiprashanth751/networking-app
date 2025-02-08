import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import { asyncHandler } from "../middleware/asyncHandler"
import jwt from "jsonwebtoken"
import CustomError from "../utils/customError"
import bcrypt from "bcrypt"
import { sendVerificationEmail } from "../utils/emailService"
import { profileCreation, profileUpdation, signinBody, signupBody } from "../types/types"


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

    await sendVerificationEmail(email, token)

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

    if(!user.verified){
        return res.status(400).json({
            message: "Please verify your email before logging in."
        })
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

export const getUser = asyncHandler(async (req:AuthRequest, res:Response) => {
   
    const userId = req.id
    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })

    return res.status(200).json({
        user
    })
     
})

export const getUserProfile = asyncHandler(async (req:AuthRequest, res:Response) => {
   
    const id = req.query.id as string
    const user = await prisma.user.findUnique({
        where: {
            id
        }
    })

    return res.status(200).json({
        user
    })
     
})

export const getUsers = asyncHandler(async (req:AuthRequest, res:Response) => {
   const userId = req.id
    const minor = req.query.minor as string

  
    const users = await prisma.user.findMany({
        where: {
            id:{not: userId},
            profile: {
                minor,
        },
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
                select: {
                    bio: true,
                    graduationYear: true,
                    department: true,
                }
            }
        }
    })

    return res.status(200).json({
        users
    })
     
})


export const createProfile = asyncHandler(async (req:AuthRequest, res:Response) => {
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
    
    const profile = await prisma.profile.create({
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

    return res.status(200).json({
        message: "Profile created successfully",
        profile
    })
     
})


export const getProfile = asyncHandler(async (req:AuthRequest, res:Response) => {
   
    const userId = req.id

    const profile = await prisma.profile.findUnique({
        where: {
            userId
        }
    })

    return res.status(200).json({
        profile
    })
     
})

export const getNative = asyncHandler(async (req:AuthRequest, res:Response) => {
   
    const id = req.query.id as string
    const profile = await prisma.profile.findUnique({
        where: {
            userId: id
        }
    })

    return res.status(200).json({
        profile
    })
     
})


export const updateProfile = asyncHandler( async (req: AuthRequest, res:Response) => {
    const {success} = profileUpdation.safeParse(req.body)
    if(!success){
        throw new CustomError("Invalid input data", 400)
    }
    const userId = req.id
    const {bio , profilePic, linkedin, github} = req.body

    const profile = await prisma.profile.update({
        where: {
            userId
        },
        data:{
            bio,
            profilePic,
            linkedin,
            github
        }
    })

    return res.status(200).json({
        message: "Profile successfully updated",
        profile
    })

})
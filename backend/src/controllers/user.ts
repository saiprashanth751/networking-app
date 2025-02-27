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
                    profilePic: true,
                }
            }
        }
    })

    return res.status(200).json({
        users
    })
     
})

export const createProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id;

   
    const existingProfile = await prisma.profile.findUnique({
        where: { userId }
    });
    if (existingProfile) {
        throw new CustomError("Profile already exists. Use update instead.", 400);
    }


    const { 
        bio, 
        department, 
        graduationYear, 
        minor, 
        linkedin, 
        github, 
        leetcode, 
        codeforces, 
        geekforgeeks 
    } = req.body;

   
    const profilePic = req.file ? (req.file as any).secure_url : null;

    const validation = profileCreation.safeParse({
        bio,
        department,
        graduationYear, 
        minor,
        linkedin,
        github,
        leetcode,
        codeforces,
        geekforgeeks,
    });

    if (!validation.success) {
        throw new CustomError("Invalid data input", 400);
    }

    const parsedGraduationYear = graduationYear ? parseInt(graduationYear) : null;


    const profile = await prisma.profile.create({
        data: {
            bio,
            profilePic, 
            department,
            graduationYear: parsedGraduationYear ?? 0,
            minor,
            linkedin,
            github,
            leetcode,
            codeforces,
            geekforgeeks,
            user: { connect: { id: userId } }
        }
    });

    return res.status(201).json({
        message: "Profile created successfully",
        profile
    });
});


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

export const getUserByName = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name } = req.query;
    const userId = req.id
    if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Name query parameter is required and must be a string" });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                id: {not : userId},
                firstName: {
                    contains: name,
                    mode: "insensitive",
                },
            },
        });

        res.status(200).json({ users });
    } catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ error: "Failed to search users" });
    }
});


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


export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id;

 
    const { success } = profileUpdation.safeParse(req.body);
    if (!success) {
        throw new CustomError("Invalid input data", 400);
    }

    
    const { bio, linkedin, github, leetcode, codeforces, geekforgeeks } = req.body;


    const profilePic = req.file ? (req.file as any).secure_url : undefined;

    // Create an object with only the fields that are provided
    const updateData: any = {};
    if (bio !== undefined) updateData.bio = bio;
    if (profilePic !== undefined) updateData.profilePic = profilePic;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (github !== undefined) updateData.github = github;
    if (leetcode !== undefined) updateData.leetcode = leetcode;
    if (codeforces !== undefined) updateData.codeforces = codeforces;
    if (geekforgeeks !== undefined) updateData.geekforgeeks = geekforgeeks;


    const profile = await prisma.profile.update({
        where: { userId },
        data: updateData,
    });

    return res.status(200).json({
        message: "Profile successfully updated",
        profile,
    });
});

export const getOnlineStatus = asyncHandler( (async (req:AuthRequest, res:Response) => {
    const  id  = req.params.id;
    const user = await prisma.user.findUnique({
        where: { id },
        select: { isOnline: true }
    });

    if(!user){
        throw new CustomError("user not found", 400);
    
    }
    return res.json({ isOnline: user.isOnline });
}

));
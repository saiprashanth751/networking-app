import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "./asyncHandler";
import CustomError from "../utils/customError";
import  jwt  from "jsonwebtoken";

interface AuthRequest extends Request{
    id?: String 
}

export const authMiddleware = asyncHandler(async(req:AuthRequest, res:Response, next:NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if(!token){
        throw new CustomError("Invalid User / User not logged in" , 400)
    }
    if(!process.env.JWT_SECRET){
        throw new CustomError("JWT key is not defined", 400)
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {id: string} // Another way is to create a custom payload.
    if(!decoded){
        throw new CustomError("Unable to verify user", 400)
    }
    req.id = decoded.id
    next()
})
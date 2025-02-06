import { Request, Response } from "express";
export declare const userSignup: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const userSignin: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getUsers: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const createProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const updateProfile: (req: Request, res: Response, next: import("express").NextFunction) => void;

import { Request, Response } from "express";
export declare const followUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const unfollowUser: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getFollowers: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getFollowing: (req: Request, res: Response, next: import("express").NextFunction) => void;

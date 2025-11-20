import { Request, Response } from "express";
export declare const sendMessage: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const getMessages: (req: Request, res: Response, next: import("express").NextFunction) => void;
export declare const markMessagesAsRead: (req: Request, res: Response, next: import("express").NextFunction) => void;

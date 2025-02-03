import zod from "zod";
export declare const signupBody: zod.ZodObject<{
    firstName: zod.ZodString;
    lastName: zod.ZodString;
    email: zod.ZodString;
    password: zod.ZodString;
}, "strip", zod.ZodTypeAny, {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}, {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}>;
export declare const signinBody: zod.ZodObject<{
    email: zod.ZodString;
    password: zod.ZodString;
}, "strip", zod.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const profileCreation: zod.ZodObject<{
    bio: zod.ZodOptional<zod.ZodString>;
    profilePic: zod.ZodOptional<zod.ZodString>;
    graduationYear: zod.ZodOptional<zod.ZodNumber>;
    department: zod.ZodString;
    minor: zod.ZodString;
    linkedin: zod.ZodOptional<zod.ZodString>;
    github: zod.ZodOptional<zod.ZodString>;
}, "strip", zod.ZodTypeAny, {
    department: string;
    minor: string;
    bio?: string | undefined;
    profilePic?: string | undefined;
    graduationYear?: number | undefined;
    linkedin?: string | undefined;
    github?: string | undefined;
}, {
    department: string;
    minor: string;
    bio?: string | undefined;
    profilePic?: string | undefined;
    graduationYear?: number | undefined;
    linkedin?: string | undefined;
    github?: string | undefined;
}>;
export declare const profileUpdation: zod.ZodObject<{
    bio: zod.ZodOptional<zod.ZodString>;
    profilePic: zod.ZodOptional<zod.ZodString>;
    linkedin: zod.ZodOptional<zod.ZodString>;
    github: zod.ZodOptional<zod.ZodString>;
}, "strip", zod.ZodTypeAny, {
    bio?: string | undefined;
    profilePic?: string | undefined;
    linkedin?: string | undefined;
    github?: string | undefined;
}, {
    bio?: string | undefined;
    profilePic?: string | undefined;
    linkedin?: string | undefined;
    github?: string | undefined;
}>;

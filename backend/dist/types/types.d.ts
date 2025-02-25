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
    graduationYear: zod.ZodOptional<zod.ZodString>;
    department: zod.ZodString;
    minor: zod.ZodString;
    linkedin: zod.ZodOptional<zod.ZodString>;
    github: zod.ZodOptional<zod.ZodString>;
    leetcode: zod.ZodOptional<zod.ZodString>;
    codeforces: zod.ZodOptional<zod.ZodString>;
    geekforgeeks: zod.ZodOptional<zod.ZodString>;
}, "strip", zod.ZodTypeAny, {
    department: string;
    minor: string;
    bio?: string | undefined;
    profilePic?: string | undefined;
    graduationYear?: string | undefined;
    linkedin?: string | undefined;
    github?: string | undefined;
    leetcode?: string | undefined;
    codeforces?: string | undefined;
    geekforgeeks?: string | undefined;
}, {
    department: string;
    minor: string;
    bio?: string | undefined;
    profilePic?: string | undefined;
    graduationYear?: string | undefined;
    linkedin?: string | undefined;
    github?: string | undefined;
    leetcode?: string | undefined;
    codeforces?: string | undefined;
    geekforgeeks?: string | undefined;
}>;
export declare const profileUpdation: zod.ZodObject<{
    bio: zod.ZodOptional<zod.ZodString>;
    profilePic: zod.ZodOptional<zod.ZodString>;
    linkedin: zod.ZodOptional<zod.ZodString>;
    github: zod.ZodOptional<zod.ZodString>;
    leetcode: zod.ZodOptional<zod.ZodString>;
    codeforces: zod.ZodOptional<zod.ZodString>;
    geekforgeeks: zod.ZodOptional<zod.ZodString>;
}, "strip", zod.ZodTypeAny, {
    bio?: string | undefined;
    profilePic?: string | undefined;
    linkedin?: string | undefined;
    github?: string | undefined;
    leetcode?: string | undefined;
    codeforces?: string | undefined;
    geekforgeeks?: string | undefined;
}, {
    bio?: string | undefined;
    profilePic?: string | undefined;
    linkedin?: string | undefined;
    github?: string | undefined;
    leetcode?: string | undefined;
    codeforces?: string | undefined;
    geekforgeeks?: string | undefined;
}>;
export declare const PostBody: zod.ZodObject<{
    title: zod.ZodString;
    description: zod.ZodString;
    labels: zod.ZodArray<zod.ZodString, "many">;
    photos: zod.ZodOptional<zod.ZodArray<zod.ZodString, "many">>;
    links: zod.ZodOptional<zod.ZodArray<zod.ZodString, "many">>;
}, "strip", zod.ZodTypeAny, {
    title: string;
    description: string;
    labels: string[];
    photos?: string[] | undefined;
    links?: string[] | undefined;
}, {
    title: string;
    description: string;
    labels: string[];
    photos?: string[] | undefined;
    links?: string[] | undefined;
}>;
export declare const MessageBody: zod.ZodObject<{
    senderId: zod.ZodString;
    receiverId: zod.ZodString;
    content: zod.ZodString;
}, "strip", zod.ZodTypeAny, {
    senderId: string;
    receiverId: string;
    content: string;
}, {
    senderId: string;
    receiverId: string;
    content: string;
}>;

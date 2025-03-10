import zod from "zod"

export const signupBody = zod.object({
    firstName: zod.string(),
    lastName: zod.string(),
    email: zod.string(),
    password: zod.string().min(8).max(20)
})

export const signinBody = zod.object({
    email: zod.string(),
    password: zod.string().min(8).max(20)
})

export const profileCreation = zod.object({
    bio: zod.string().optional(),
    profilePic: zod.string().optional(),
    graduationYear: zod.string().optional(),
    department: zod.string(),
    minor: zod.string(),
    linkedin: zod.string().optional(),
    github: zod.string().optional(),
    leetcode: zod.string().optional(),
    codeforces: zod.string().optional(),
    geekforgeeks: zod.string().optional()
});

export const profileUpdation = zod.object({
    bio: zod.string().optional(),
    profilePic: zod.string().optional(),
    linkedin: zod.string().optional(),
    github: zod.string().optional(),
    leetcode: zod.string().optional(),
    codeforces: zod.string().optional(),
    geekforgeeks: zod.string().optional()
})


export const PostBody = zod.object({
    title: zod.string(),
    description: zod.string(),
    labels: zod.array(zod.string()),
    photos: zod.array(zod.string()).optional(),
    links: zod.array(zod.string()).optional(),
})

export const MessageBody = zod.object({
    senderId: zod.string(),
    receiverId: zod.string(),
    content: zod.string()
})
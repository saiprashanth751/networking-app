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
    graduationYear: zod.number().optional(),
    department: zod.string(),
    minor: zod.string(),
    linkedin: zod.string().optional(),
    github: zod.string().optional()
})

export const profileUpdation = zod.object({
    bio: zod.string().optional(),
    profilePic: zod.string().optional(),
    linkedin: zod.string().optional(),
    github: zod.string().optional()
})

export const ProjectBody = zod.object({
    title: zod.string(),
    description: zod.string()
})


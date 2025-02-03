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




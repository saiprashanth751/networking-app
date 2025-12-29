import { z } from 'zod';

// Validation schema for creating a project
export const createProjectSchema = z.object({
    title: z.string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must not exceed 100 characters'),

    description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(5000, 'Description must not exceed 5000 characters'),

    tagline: z.string()
        .max(200, 'Tagline must not exceed 200 characters')
        .optional()
        .or(z.literal('')),

    techStack: z.string() // Will be parsed as JSON array
        .refine((val) => {
            try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) && parsed.length >= 1 && parsed.length <= 20;
            } catch {
                return false;
            }
        }, 'Tech stack must be a valid JSON array with 1-20 items'),

    category: z.enum(['web', 'mobile', 'ai', 'blockchain', 'devops', 'other'])
        .optional()
        .or(z.literal('')),

    repositoryUrl: z.string()
        .url('Invalid repository URL')
        .optional()
        .or(z.literal(''))
        .transform(v => v || undefined),

    liveUrl: z.string()
        .url('Invalid live URL')
        .optional()
        .or(z.literal(''))
        .transform(v => v || undefined),

    demoVideoUrl: z.string()
        .url('Invalid demo video URL')
        .optional()
        .or(z.literal(''))
        .transform(v => v || undefined),

    status: z.enum(['in-progress', 'completed', 'archived'])
        .default('completed'),

    startDate: z.string()
        .datetime()
        .optional()
        .or(z.literal('')),

    endDate: z.string()
        .datetime()
        .optional()
        .or(z.literal('')),
}).refine((data) => {
    // Validate date logic: start date must be before end date
    if (data.startDate && data.endDate) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return start <= end;
    }
    return true;
}, {
    message: 'Start date must be before or equal to end date',
    path: ['endDate'],
});

// Validation schema for updating a project
export const updateProjectSchema = createProjectSchema.partial();

// Type exports
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

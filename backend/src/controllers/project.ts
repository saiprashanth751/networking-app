import { Response, Request } from 'express';
import prisma from "../../prisma/prisma_client";
import { asyncHandler } from '../middleware/asyncHandler';
import CustomError from '../utils/customError';

interface AuthRequest extends Request {
  id?: string;
}

// Create Project
export const createProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  console.log('📸 [Project Upload] Files received:', req.files);
  console.log('📝 [Project Upload] Body received:', req.body);

  const {
    title,
    description,
    tagline,
    techStack,
    category,
    repositoryUrl,
    liveUrl,
    demoVideoUrl,
    status,
    startDate,
    endDate
  } = req.body;

  // Validate required fields
  if (!title?.trim()) {
    throw new CustomError('Title is required', 400);
  }

  if (!description?.trim()) {
    throw new CustomError('Description is required', 400);
  }

  if (!techStack) {
    throw new CustomError('Tech stack is required', 400);
  }

  // Safe JSON parsing with validation
  let parsedTechStack: string[] = [];
  try {
    parsedTechStack = typeof techStack === 'string' ? JSON.parse(techStack) : techStack;

    if (!Array.isArray(parsedTechStack)) {
      throw new CustomError('Tech stack must be an array', 400);
    }

    if (parsedTechStack.length === 0) {
      throw new CustomError('At least one technology is required', 400);
    }

    if (parsedTechStack.length > 20) {
      throw new CustomError('Maximum 20 technologies allowed', 400);
    }
  } catch (error: any) {
    if (error instanceof CustomError) throw error;
    throw new CustomError('Invalid tech stack format', 400);
  }

  // Validate string lengths
  if (title.length < 3 || title.length > 100) {
    throw new CustomError('Title must be between 3 and 100 characters', 400);
  }

  if (description.length < 10 || description.length > 5000) {
    throw new CustomError('Description must be between 10 and 5000 characters', 400);
  }

  // Handle file uploads from Cloudinary middleware
  let coverImagePath: string | undefined;
  let imagePaths: string[] = [];

  if (req.files && typeof req.files === 'object') {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files.coverImage && files.coverImage[0]) {
      coverImagePath = (files.coverImage[0] as any).cloudinaryUrl;
      console.log('✅ [Project Upload] Cover image uploaded:', coverImagePath);
    }

    if (files.images && files.images.length > 0) {
      imagePaths = files.images.map((file: any) => file.cloudinaryUrl);
      console.log(`✅ [Project Upload] ${imagePaths.length} gallery images uploaded`);
    }
  }

  // Validate and parse dates
  let parsedStartDate: Date | null = null;
  let parsedEndDate: Date | null = null;

  if (startDate) {
    parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate.getTime())) {
      throw new CustomError('Invalid start date format', 400);
    }
  }

  if (endDate) {
    parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate.getTime())) {
      throw new CustomError('Invalid end date format', 400);
    }
  }

  if (parsedStartDate && parsedEndDate && parsedStartDate > parsedEndDate) {
    throw new CustomError('Start date must be before or equal to end date', 400);
  }

  try {
    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        tagline: tagline?.trim() || null,
        coverImage: coverImagePath,
        images: imagePaths,
        techStack: parsedTechStack,
        category: category || null,
        repositoryUrl: repositoryUrl || null,
        liveUrl: liveUrl || null,
        demoVideoUrl: demoVideoUrl || null,
        status: status || 'completed',
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        user: {
          connect: { id: req.id }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                profilePic: true,
                department: true
              }
            }
          }
        }
      }
    });

    console.log(`✅ [Project Created] ID: ${project.id}, Title: ${project.title}`);

    return res.status(201).json({
      message: "Project successfully created",
      project
    });
  } catch (error: any) {
    console.error("❌ [Project Creation Error]:", error);

    // Handle Prisma-specific errors
    if (error.code === 'P2002') {
      throw new CustomError('A project with this title already exists', 409);
    }

    if (error.code === 'P2003') {
      throw new CustomError('Invalid user reference', 400);
    }

    throw new CustomError(error.message || "Failed to create project", 500);
  }
});

// Update Project
export const updateProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    title,
    description,
    tagline,
    techStack,
    category,
    repositoryUrl,
    liveUrl,
    demoVideoUrl,
    status,
    startDate,
    endDate
  } = req.body;

  // Check ownership
  const existingProject = await prisma.project.findUnique({
    where: { id },
    select: { userId: true }
  });

  if (!existingProject) {
    throw new CustomError("Project not found", 404);
  }

  if (existingProject.userId !== req.id) {
    throw new CustomError("Not authorized to update this project", 403);
  }

  // Handle file uploads
  let coverImagePath: string | undefined;
  let imagePaths: string[] = [];

  if (req.files && typeof req.files === 'object') {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files.coverImage && files.coverImage[0]) {
      coverImagePath = (files.coverImage[0] as any).cloudinaryUrl;
    }

    if (files.images) {
      imagePaths = files.images.map((file: any) => file.cloudinaryUrl);
    }
  }

  const parsedTechStack = techStack ? JSON.parse(techStack) : undefined;

  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(tagline !== undefined && { tagline }),
        ...(coverImagePath && { coverImage: coverImagePath }),
        ...(imagePaths.length > 0 && { images: imagePaths }),
        ...(parsedTechStack && { techStack: parsedTechStack }),
        ...(category !== undefined && { category }),
        ...(repositoryUrl !== undefined && { repositoryUrl }),
        ...(liveUrl !== undefined && { liveUrl }),
        ...(demoVideoUrl !== undefined && { demoVideoUrl }),
        ...(status && { status }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) })
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                profilePic: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json({
      message: "Project successfully updated",
      project
    });
  } catch (error) {
    console.error("Failed to update project:", error);
    throw new CustomError("Failed to update project", 500);
  }
});

// Delete Project
export const deleteProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const existingProject = await prisma.project.findUnique({
    where: { id },
    select: { userId: true }
  });

  if (!existingProject) {
    throw new CustomError("Project not found", 404);
  }

  if (existingProject.userId !== req.id) {
    throw new CustomError("Not authorized to delete this project", 403);
  }

  await prisma.project.delete({ where: { id } });

  return res.status(200).json({
    message: "Project successfully deleted"
  });
});

// Toggle Featured Status
export const toggleFeaturedProject = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const existingProject = await prisma.project.findUnique({
    where: { id },
    select: { userId: true, featured: true }
  });

  if (!existingProject) {
    throw new CustomError("Project not found", 404);
  }

  if (existingProject.userId !== req.id) {
    throw new CustomError("Not authorized to modify this project", 403);
  }

  const project = await prisma.project.update({
    where: { id },
    data: { featured: !existingProject.featured }
  });

  return res.status(200).json({
    message: `Project ${project.featured ? 'featured' : 'unfeatured'} successfully`,
    project
  });
});

// Get All Projects with Pagination, Filtering, and Search
export const getAllProjects = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '12',
    category,
    search,
    sortBy = 'recent',
    featured
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // Validate pagination params
  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    throw new CustomError('Invalid pagination parameters', 400);
  }

  // Build where clause
  const where: any = {};

  if (category && category !== 'all') {
    where.category = category;
  }

  if (featured === 'true') {
    where.featured = true;
  }

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  // Build orderBy
  let orderBy: any = {};
  if (sortBy === 'recent') {
    orderBy = { createdAt: 'desc' };
  } else if (sortBy === 'oldest') {
    orderBy = { createdAt: 'asc' };
  } else if (sortBy === 'featured') {
    orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
  }

  try {
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profile: {
                select: {
                  profilePic: true,
                  department: true
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.project.count({ where }),
    ]);

    console.log(`📊 [Projects Fetched] Page ${pageNum}, ${projects.length}/${total} total`);

    return res.status(200).json({
      projects,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + limitNum < total,
      }
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new CustomError('Failed to fetch projects', 500);
  }
});

// Get Project by ID
export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profile: {
            select: {
              profilePic: true,
              department: true
            }
          }
        }
      }
    }
  });

  if (!project) {
    throw new CustomError("Project not found", 404);
  }

  return res.status(200).json({ project });
});

// Get User Projects
export const getUserProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.params.userId || req.id;

  if (!userId) {
    throw new CustomError("User ID is required", 400);
  }

  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profile: {
            select: {
              profilePic: true,
              department: true
            }
          }
        }
      }
    },
    orderBy: [
      { featured: 'desc' },
      { createdAt: 'desc' }
    ]
  });

  return res.status(200).json({ projects });
});
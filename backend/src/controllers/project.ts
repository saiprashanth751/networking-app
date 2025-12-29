import { Response, Request } from 'express';
import prisma from "../../prisma/prisma_client";
import { asyncHandler } from '../middleware/asyncHandler';
import CustomError from '../utils/customError';

interface AuthRequest extends Request {
  id?: string;
}

// Create Project
export const createProject = asyncHandler(async (req: AuthRequest, res: Response) => {
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

  // Parse arrays
  const parsedTechStack = techStack ? JSON.parse(techStack) : [];

  try {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        tagline: tagline || null,
        coverImage: coverImagePath,
        images: imagePaths,
        techStack: parsedTechStack,
        category: category || null,
        repositoryUrl: repositoryUrl || null,
        liveUrl: liveUrl || null,
        demoVideoUrl: demoVideoUrl || null,
        status: status || 'completed',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
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
                profilePic: true
              }
            }
          }
        }
      }
    });

    return res.status(201).json({
      message: "Project successfully created",
      project
    });
  } catch (error) {
    console.error("Failed to create project:", error);
    throw new CustomError("Failed to create project", 500);
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

// Get All Projects
export const getAllProjects = asyncHandler(async (req: Request, res: Response) => {
  const projects = await prisma.project.findMany({
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
    orderBy: { createdAt: 'desc' }
  });

  return res.status(200).json({ projects });
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
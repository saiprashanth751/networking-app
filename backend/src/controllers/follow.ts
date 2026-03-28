import { asyncHandler } from "../middleware/asyncHandler";
import { Request, Response } from "express";
import prisma from "../../prisma/prisma_client";
import CustomError from "../utils/customError";
import { notificationService } from "../services/notificationService";
import { emitNotification } from "../utils/socket";


interface AuthRequest extends Request {
    id?: string
}

export const followUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id as string
    const tofollow = req.query.id as string;
    const follow = await prisma.follow.create({
        data: {
            followerId: userId,
            followingId: tofollow
        }
    })

    // Get follower details for notification
    const follower = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true }
    });

    // Create notification for the followed user
    if (follower) {
        const notification = await notificationService.create({
            userId: tofollow,
            type: 'NEW_FOLLOWER',
            title: 'New Follower',
            message: `${follower.firstName} ${follower.lastName || ''} started following you`,
            actorId: userId
        });

        // Emit real-time notification
        if (notification) {
            emitNotification(tofollow, notification);
        }
    }

    return res.status(200).json({
        message: "Followed"
    })
})

export const unfollowUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id as string
    const tounfollow = req.query.id as string

    await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId: userId,
                followingId: tounfollow
            }
        }
    })

    return res.status(200).json({
        message: "User successfully unfollwed"
    })
})

export const getStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id as string
    const tocheckId = req.query.id as string

    const isFollowing = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: userId,
                followingId: tocheckId
            }
        }
    })
    return res.json({
        following: Boolean(isFollowing)
    })
})

export const getFollowers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id as string;

    const followers = await prisma.follow.findMany({
        where: {
            followingId: userId,
        },
        include: {
            follower: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,  // ✅ ADD THIS
                    profile: {        // ✅ ADD THIS
                        select: {
                            profilePic: true,
                            bio: true,
                            department: true,
                        }
                    }
                },
            },
        },
    });

    return res.status(200).json({
        followers: followers.map((follow) => follow.follower),
        count: followers.length,
    });
});

export const getNativeFollowers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.query.id as string

    // ✅ FIXED: Include user data in the query
    const followers = await prisma.follow.findMany({
        where: {
            followingId: userId,
        },
        include: {
            follower: {  // ✅ Include the actual follower user data
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profile: {
                        select: {
                            profilePic: true,
                            bio: true,
                            department: true,
                        }
                    }
                }
            }
        }
    })

    // ✅ FIXED: Map to return user objects, not Follow objects
    return res.status(200).json({
        followers: followers.map(follow => follow.follower),  // Extract user data
        count: followers.length
    })
})

export const getFollowing = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.id as string;

    const followingUsers = await prisma.follow.findMany({
        where: {
            followerId: userId,
        },
        include: {
            following: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,  // ✅ ADD THIS
                    profile: {        // ✅ ADD THIS
                        select: {
                            profilePic: true,
                            bio: true,
                            department: true,
                        }
                    }
                },
            },
        },
    });

    return res.status(200).json({
        following: followingUsers.map((follow) => follow.following),
        count: followingUsers.length,
    });
});

export const getNativeFollowing = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.query.id as string

    // ✅ FIXED: Include user data in the query
    const followingUsers = await prisma.follow.findMany({
        where: {
            followerId: userId,
        },
        include: {
            following: {  // ✅ Include the actual following user data
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    profile: {
                        select: {
                            profilePic: true,
                            bio: true,
                            department: true,
                        }
                    }
                }
            }
        }
    })

    // ✅ FIXED: Map to return user objects, not Follow objects
    return res.status(200).json({
        following: followingUsers.map(follow => follow.following),  // Extract user data
        count: followingUsers.length
    })
})

// Get mutual connections between current user and target user
export const getMutualConnections = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.id!;

    // Can't get mutual connections with yourself
    if (currentUserId === targetUserId) {
        return res.status(400).json({
            message: 'Cannot get mutual connections with yourself',
        });
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, firstName: true, lastName: true }
    });

    if (!targetUser) {
        throw new CustomError('User not found', 404);
    }

    // Get users that current user follows
    const currentUserFollowing = await prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true }
    });
    const currentUserFollowingIds = currentUserFollowing.map(f => f.followingId);

    // Get users that target user follows
    const targetUserFollowing = await prisma.follow.findMany({
        where: { followerId: targetUserId },
        select: { followingId: true }
    });
    const targetUserFollowingIds = targetUserFollowing.map(f => f.followingId);

    // Find intersection - mutual follows (both users follow these people)
    const mutualFollowingIds = currentUserFollowingIds.filter(id =>
        targetUserFollowingIds.includes(id)
    );

    // Get users that follow current user
    const currentUserFollowers = await prisma.follow.findMany({
        where: { followingId: currentUserId },
        select: { followerId: true }
    });
    const currentUserFollowerIds = currentUserFollowers.map(f => f.followerId);

    // Get users that follow target user
    const targetUserFollowers = await prisma.follow.findMany({
        where: { followingId: targetUserId },
        select: { followerId: true }
    });
    const targetUserFollowerIds = targetUserFollowers.map(f => f.followerId);

    // Find mutual followers (people who follow both users)
    const mutualFollowerIds = currentUserFollowerIds.filter(id =>
        targetUserFollowerIds.includes(id)
    );

    // Combine and deduplicate
    const allMutualIds = [...new Set([...mutualFollowingIds, ...mutualFollowerIds])];

    // Fetch user details for mutual connections
    const mutualConnections = await prisma.user.findMany({
        where: {
            id: { in: allMutualIds }
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
                select: {
                    profilePic: true,
                    bio: true
                }
            }
        },
        take: 20 // Limit to 20 for performance
    });

    // Determine connection path
    let connectionPath: string[] = ['You'];
    let connectionType: 'direct' | 'mutual' | 'none' = 'none';

    // Check if current user follows target user (direct connection)
    const isDirectConnection = currentUserFollowingIds.includes(targetUserId);

    if (isDirectConnection) {
        connectionPath.push(targetUser.firstName);
        connectionType = 'direct';
    } else if (mutualConnections.length > 0) {
        // Connection through mutual friend
        connectionPath.push(mutualConnections[0].firstName);
        connectionPath.push(targetUser.firstName);
        connectionType = 'mutual';
    } else {
        connectionPath.push('No connection');
        connectionType = 'none';
    }

    return res.status(200).json({
        message: 'Mutual connections retrieved successfully',
        mutualConnections,
        count: allMutualIds.length,
        showing: mutualConnections.length,
        connectionPath,
        connectionType,
        isFollowing: isDirectConnection
    });
});

// Remove a follower (someone who follows you)
export const removeFollower = asyncHandler(async (req: AuthRequest, res: Response) => {
    const currentUserId = req.id!;
    const { followerId } = req.params;

    // Verify the follow relationship exists (follower follows current user)
    const followRelationship = await prisma.follow.findFirst({
        where: {
            followerId: followerId,
            followingId: currentUserId
        }
    });

    if (!followRelationship) {
        throw new CustomError('This user is not following you', 404);
    }

    // Delete the follow relationship
    await prisma.follow.delete({
        where: {
            id: followRelationship.id
        }
    });

    return res.status(200).json({
        message: 'Follower removed successfully'
    });
});

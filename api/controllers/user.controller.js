const prisma = require("../config/db");
const { createNotification } = require("./notification.controller");

// Get All Users (with pagination)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;
    const search = req.query.search || "";

    const whereClause = search
      ? {
          OR: [
            { username: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [users, totalElements] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: {
          createdDate: "desc",
        },
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          imgUrl: true,
          coverImgUrl: true,
          city: true,
          createdDate: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(totalElements / size);

    res.status(200).json({
      content: users,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 1,
      last: page === totalPages,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get User Profile by ID
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId || req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        imgUrl: true,
        coverImgUrl: true,
        city: true,
        createdDate: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if current user is following this user
    const isFollowing = await prisma.follow.findFirst({
      where: {
        followerId: currentUserId,
        followingId: parseInt(userId),
      },
    });

    res.status(200).json({
      user: {
        ...user,
        isFollowing: !!isFollowing,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

// Update User Profile
const updateUser = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const { firstName, lastName, imgUrl, coverImgUrl, city } = req.body;

    const updateData = {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(imgUrl !== undefined && { imgUrl }),
      ...(coverImgUrl !== undefined && { coverImgUrl }),
      ...(city !== undefined && { city }),
    };

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        imgUrl: true,
        coverImgUrl: true,
        city: true,
        createdDate: true,
        lastModifiedDate: true,
      },
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Delete User Account
const deleteUser = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
};

// Follow/Unfollow User (Toggle)
const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.userId || req.user.id;
    const followingId = parseInt(userId);

    // Can't follow yourself
    if (followerId === followingId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!userToFollow) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId,
        followingId,
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });

      return res.status(200).json({
        message: "Unfollowed successfully",
        isFollowing: false,
      });
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });

      // Get current user info for notification message
      const currentUser = await prisma.user.findUnique({
        where: { id: followerId },
        select: {
          username: true,
          firstName: true,
          lastName: true,
        },
      });

      // Create display name
      const displayName =
        currentUser.firstName && currentUser.lastName
          ? `${currentUser.firstName} ${currentUser.lastName}`
          : currentUser.username;

      // Create notification for the followed user
      await createNotification({
        userId: followingId, // User who receives the notification
        triggeredByUserId: followerId, // User who triggered the action
        type: "FOLLOW",
        title: "New Follower",
        message: `${displayName} started following you`,
        referenceId: followerId, // Reference to the follower
      });

      return res.status(201).json({
        message: "Followed successfully",
        isFollowing: true,
      });
    }
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({ error: "Failed to follow/unfollow user" });
  }
};

// Get User Followers (with pagination)
const getUserFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const [followers, totalElements] = await Promise.all([
      prisma.follow.findMany({
        where: {
          followingId: parseInt(userId),
        },
        skip,
        take: size,
        orderBy: {
          createdDate: "desc",
        },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              imgUrl: true,
              _count: {
                select: {
                  followers: true,
                  following: true,
                },
              },
            },
          },
        },
      }),
      prisma.follow.count({
        where: {
          followingId: parseInt(userId),
        },
      }),
    ]);

    // Get all follower IDs to check if current user follows them
    const followerIds = followers.map((f) => f.follower.id);

    const currentUserFollowing = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: {
          in: followerIds,
        },
      },
      select: {
        followingId: true,
      },
    });

    const followingSet = new Set(
      currentUserFollowing.map((f) => f.followingId)
    );

    // Add isFollowing field to each follower
    const followersWithFollowStatus = followers.map((follow) => ({
      ...follow,
      follower: {
        ...follow.follower,
        isFollowing: followingSet.has(follow.follower.id),
      },
    }));

    const totalPages = Math.ceil(totalElements / size);

    res.status(200).json({
      content: followersWithFollowStatus,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 1,
      last: page === totalPages,
    });
  } catch (error) {
    console.error("Get user followers error:", error);
    res.status(500).json({ error: "Failed to fetch followers" });
  }
};

// Get User Following (with pagination)
const getUserFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const [following, totalElements] = await Promise.all([
      prisma.follow.findMany({
        where: {
          followerId: parseInt(userId),
        },
        skip,
        take: size,
        orderBy: {
          createdDate: "desc",
        },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              imgUrl: true,
              _count: {
                select: {
                  followers: true,
                  following: true,
                },
              },
            },
          },
        },
      }),
      prisma.follow.count({
        where: {
          followerId: parseInt(userId),
        },
      }),
    ]);

    // Get all following IDs to check if current user follows them
    const followingIds = following.map((f) => f.following.id);

    const currentUserFollowing = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: {
          in: followingIds,
        },
      },
      select: {
        followingId: true,
      },
    });

    const followingSet = new Set(
      currentUserFollowing.map((f) => f.followingId)
    );

    // Add isFollowing field to each following user
    const followingWithFollowStatus = following.map((follow) => ({
      ...follow,
      following: {
        ...follow.following,
        isFollowing: followingSet.has(follow.following.id),
      },
    }));

    const totalPages = Math.ceil(totalElements / size);

    res.status(200).json({
      content: followingWithFollowStatus,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 1,
      last: page === totalPages,
    });
  } catch (error) {
    console.error("Get user following error:", error);
    res.status(500).json({ error: "Failed to fetch following" });
  }
};

// Get Suggested Users (users not followed by current user)
const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.user.userId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;

    // Get IDs of users that current user is already following
    const following = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((f) => f.followingId);

    // Get users that current user is NOT following (excluding self)
    const whereClause = {
      id: {
        notIn: [...followingIds, currentUserId],
      },
    };

    const [users, totalElements] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: size,
        orderBy: [
          {
            followers: {
              _count: "desc", // Sort by most followed users first
            },
          },
          {
            createdDate: "desc",
          },
        ],
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true,
          imgUrl: true,
          coverImgUrl: true,
          city: true,
          createdDate: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
            },
          },
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    // Add isFollowing field (will be false for all suggested users)
    const usersWithFollowStatus = users.map((user) => ({
      ...user,
      isFollowing: false,
    }));

    const totalPages = Math.ceil(totalElements / size);

    res.status(200).json({
      content: usersWithFollowStatus,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 1,
      last: page === totalPages,
    });
  } catch (error) {
    console.error("Get suggested users error:", error);
    res.status(500).json({ error: "Failed to fetch suggested users" });
  }
};

module.exports = {
  getAllUsers,
  getUserProfile,
  updateUser,
  deleteUser,
  followUser,
  getUserFollowers,
  getUserFollowing,
  getSuggestedUsers,
};

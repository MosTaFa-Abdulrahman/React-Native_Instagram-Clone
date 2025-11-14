const prisma = require("../config/db");
const { createNotification } = require("./notification.controller");

// Create Post
const createPost = async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const userId = req.user.userId || req.user.id;

    const post = await prisma.post.create({
      data: {
        title: title || null,
        description,
        imageUrl,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imgUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    // Log the actual error for debugging
    console.error("Error details:", error.message);
    res.status(500).json({
      error: "Failed to create post",
      details: error.message,
    });
  }
};

// Update Post
const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, description, imageUrl } = req.body;
    const userId = req.user.userId || req.user.id;

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existingPost.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this post" });
    }

    const post = await prisma.post.update({
      where: { id: parseInt(postId) },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imgUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
};

// Delete Post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId || req.user.id;

    // Check if post exists and belongs to user
    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existingPost.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this post" });
    }

    await prisma.post.delete({
      where: { id: parseInt(postId) },
    });

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
};

// Get All Posts (with pagination + isLiked & isSaved)
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;

    // Get current user ID (may be undefined if not authenticated)
    const currentUserId = req.user?.userId || req.user?.id;

    const [posts, totalElements] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: size,
        orderBy: {
          createdDate: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              imgUrl: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
          ...(currentUserId && {
            likes: {
              where: {
                userId: currentUserId,
              },
              select: {
                id: true,
              },
            },
            savedBy: {
              where: {
                userId: currentUserId,
              },
              select: {
                id: true,
              },
            },
          }),
        },
      }),
      prisma.post.count(),
    ]);

    // Transform posts to include isLiked and isSaved
    const transformedPosts = posts.map((post) => ({
      ...post,
      isLiked: currentUserId ? post.likes?.length > 0 : false,
      isSaved: currentUserId ? post.savedBy?.length > 0 : false,
      // Remove the likes and savedBy arrays from response
      likes: undefined,
      savedBy: undefined,
    }));

    const totalPages = Math.ceil(totalElements / size);

    res.status(200).json({
      content: transformedPosts,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 1,
      last: page === totalPages,
    });
  } catch (error) {
    console.error("Get all posts error:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
};

// Get Posts by User (with pagination + isLiked & isSaved)
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;

    // Get current user ID (may be undefined if not authenticated)
    const currentUserId = req.user?.userId || req.user?.id;

    const [posts, totalElements] = await Promise.all([
      prisma.post.findMany({
        where: {
          userId: parseInt(userId),
        },
        skip,
        take: size,
        orderBy: {
          createdDate: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              imgUrl: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
          ...(currentUserId && {
            likes: {
              where: {
                userId: currentUserId,
              },
              select: {
                id: true,
              },
            },
            savedBy: {
              where: {
                userId: currentUserId,
              },
              select: {
                id: true,
              },
            },
          }),
        },
      }),
      prisma.post.count({
        where: {
          userId: parseInt(userId),
        },
      }),
    ]);

    // Transform posts to include isLiked and isSaved
    const transformedPosts = posts.map((post) => ({
      ...post,
      isLiked: currentUserId ? post.likes?.length > 0 : false,
      isSaved: currentUserId ? post.savedBy?.length > 0 : false,
      // Remove the likes and savedBy arrays from response
      likes: undefined,
      savedBy: undefined,
    }));

    const totalPages = Math.ceil(totalElements / size);

    res.status(200).json({
      content: transformedPosts,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 1,
      last: page === totalPages,
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({ error: "Failed to fetch user posts" });
  }
};

// Get Single Post (with isLiked & isSaved)
const getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUserId = req.user?.userId || req.user?.id;

    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imgUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        ...(currentUserId && {
          likes: {
            where: {
              userId: currentUserId,
            },
            select: {
              id: true,
            },
          },
          savedBy: {
            where: {
              userId: currentUserId,
            },
            select: {
              id: true,
            },
          },
        }),
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Transform post to include isLiked and isSaved
    const transformedPost = {
      ...post,
      isLiked: currentUserId ? post.likes?.length > 0 : false,
      isSaved: currentUserId ? post.savedBy?.length > 0 : false,
      likes: undefined,
      savedBy: undefined,
    };

    res.status(200).json({ post: transformedPost });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
};

// Like Post (Toggle)
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = parseInt(req.user.userId || req.user.id); // Convert to integer

    // Validate userId
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Validate postId
    const parsedPostId = parseInt(postId);
    if (isNaN(parsedPostId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: parsedPostId },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if already liked
    const existingLike = await prisma.postLike.findFirst({
      where: {
        userId: userId,
        postId: parsedPostId,
      },
    });

    if (existingLike) {
      // Unlike (remove like)
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });

      return res.status(200).json({
        message: "Post unliked successfully",
        liked: false,
      });
    } else {
      // Like
      await prisma.postLike.create({
        data: {
          userId: userId,
          postId: parsedPostId,
        },
      });

      // Only send notification if user is not liking their own post
      if (post.userId !== userId) {
        // Get current user info for notification message
        const currentUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            username: true,
            firstName: true,
            lastName: true,
          },
        });

        if (currentUser) {
          // Create display name
          const displayName =
            currentUser.firstName && currentUser.lastName
              ? `${currentUser.firstName} ${currentUser.lastName}`
              : currentUser.username;

          // Create notification for post owner
          await createNotification({
            userId: post.userId, // Post owner receives the notification
            triggeredByUserId: userId, // Current user who liked the post
            type: "LIKE",
            title: "New Like",
            message: `${displayName} liked your post`,
            referenceId: post.id,
          });
        }
      }

      return res.status(201).json({
        message: "Post liked successfully",
        liked: true,
      });
    }
  } catch (error) {
    console.error("Like post error:", error);
    console.error("Error details:", error.message); // Add more detailed logging
    res.status(500).json({ error: "Failed to like/unlike post" });
  }
};

// Get Post Likes (Who liked the post - with pagination)
const getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUserId = req.user.userId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const [likes, totalElements] = await Promise.all([
      prisma.postLike.findMany({
        where: {
          postId: parseInt(postId),
        },
        skip,
        take: size,
        orderBy: {
          createdDate: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              imgUrl: true,
            },
          },
        },
      }),
      prisma.postLike.count({
        where: {
          postId: parseInt(postId),
        },
      }),
    ]);

    // Get all user IDs who liked the post
    const userIds = likes.map((like) => like.user.id);

    const currentUserFollowing = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: {
          in: userIds,
        },
      },
      select: {
        followingId: true,
      },
    });

    const followingSet = new Set(
      currentUserFollowing.map((f) => f.followingId)
    );

    // Add isFollowing field to each user
    const likesWithFollowStatus = likes.map((like) => ({
      ...like,
      user: {
        ...like.user,
        isFollowing: followingSet.has(like.user.id),
      },
    }));

    const totalPages = Math.ceil(totalElements / size);

    res.status(200).json({
      content: likesWithFollowStatus,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 1,
      last: page === totalPages,
    });
  } catch (error) {
    console.error("Get post likes error:", error);
    res.status(500).json({ error: "Failed to fetch post likes" });
  }
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getUserPosts,
  getPost,
  likePost,
  getPostLikes,
};

const prisma = require("../config/db");
const { createNotification } = require("./notification.controller");

// Create Comment
const createComment = async (req, res) => {
  try {
    const { text, postId } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    if (!postId) {
      return res.status(400).json({ error: "Post ID is required" });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        userId,
        postId: parseInt(postId),
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
            replies: true,
          },
        },
      },
    });

    // Get current user info for notification message
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
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

    // Create notification for post owner
    await createNotification({
      userId: post.userId,
      triggeredByUserId: userId,
      type: "COMMENT",
      title: "New Comment",
      message: `${displayName} commented on your post`,
      referenceId: post.id,
    });

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
};

// Update Comment
const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Check if comment exists and belongs to user
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existingComment.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this comment" });
    }

    const comment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: { text },
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
            replies: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Comment updated successfully",
      comment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
};

// Delete Comment
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId || req.user.id;

    // Check if comment exists and belongs to user
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    if (existingComment.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this comment" });
    }

    await prisma.comment.delete({
      where: { id: parseInt(commentId) },
    });

    res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};

// Get Comments by Post (with pagination)
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;
    const userId = req.user.userId || req.user.id;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const [comments, totalElements] = await Promise.all([
      prisma.comment.findMany({
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
          likes: userId
            ? {
                where: {
                  userId: userId,
                },
                select: {
                  id: true,
                },
              }
            : false,
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
      }),
      prisma.comment.count({
        where: {
          postId: parseInt(postId),
        },
      }),
    ]);

    // Map comments to add isLiked field
    const commentsWithLikeStatus = comments.map((comment) => ({
      ...comment,
      isLiked: comment.likes && comment.likes.length > 0,
      likes: undefined, // Remove likes array from response
    }));

    const totalPages = Math.ceil(totalElements / size);

    res.status(200).json({
      content: commentsWithLikeStatus,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 1,
      last: page === totalPages,
    });
  } catch (error) {
    console.error("Get post comments error:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

// Get Single Comment
const getComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
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
        post: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    res.status(200).json({ comment });
  } catch (error) {
    console.error("Get comment error:", error);
    res.status(500).json({ error: "Failed to fetch comment" });
  }
};

// Like Comment (Toggle)
const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId || req.user.id;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if already liked
    const existingLike = await prisma.commentLike.findFirst({
      where: {
        userId,
        commentId: parseInt(commentId),
      },
    });

    if (existingLike) {
      // Unlike (remove like)
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      });

      return res.status(200).json({
        message: "Comment unliked successfully",
        liked: false,
      });
    } else {
      // Like
      await prisma.commentLike.create({
        data: {
          userId,
          commentId: parseInt(commentId),
        },
      });

      // Get current user info for notification message
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
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

      // Create notification for comment owner
      await createNotification({
        userId: comment.userId,
        triggeredByUserId: userId,
        type: "LIKE",
        title: "New Like",
        message: `${displayName} liked your comment`,
        referenceId: comment.id,
      });

      return res.status(201).json({
        message: "Comment liked successfully",
        liked: true,
      });
    }
  } catch (error) {
    console.error("Like comment error:", error);
    res.status(500).json({ error: "Failed to like/unlike comment" });
  }
};

// Get Comment Likes (Who liked the comment - with pagination)
const getCommentLikes = async (req, res) => {
  try {
    const { commentId } = req.params;
    const currentUserId = req.user.id; // Get current user from auth middleware
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const [likes, totalElements] = await Promise.all([
      prisma.commentLike.findMany({
        where: {
          commentId: parseInt(commentId),
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
              followers: {
                where: {
                  followerId: currentUserId,
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      }),
      prisma.commentLike.count({
        where: {
          commentId: parseInt(commentId),
        },
      }),
    ]);

    // Transform the data to include isFollowing field
    const likesWithFollowStatus = likes.map((like) => ({
      ...like,
      user: {
        id: like.user.id,
        username: like.user.username,
        firstName: like.user.firstName,
        lastName: like.user.lastName,
        imgUrl: like.user.imgUrl,
        isFollowing: like.user.followers.length > 0,
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
    console.error("Get comment likes error:", error);
    res.status(500).json({ error: "Failed to fetch comment likes" });
  }
};

module.exports = {
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
  getComment,
  likeComment,
  getCommentLikes,
};

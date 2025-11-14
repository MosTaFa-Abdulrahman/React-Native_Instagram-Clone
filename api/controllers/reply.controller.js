const prisma = require("../config/db");
const { createNotification } = require("./notification.controller");

// Create Reply
const createReply = async (req, res) => {
  try {
    const { text, commentId } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    if (!commentId) {
      return res.status(400).json({ error: "Comment ID is required" });
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const reply = await prisma.reply.create({
      data: {
        text,
        userId,
        commentId: parseInt(commentId),
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

    // Create notification for comment owner
    await createNotification({
      userId: comment.userId, // Comment owner receives the notification
      triggeredByUserId: userId, // Current user who replied
      type: "REPLY",
      title: "New Reply",
      message: `${displayName} replied to your comment`,
      referenceId: comment.id,
    });

    res.status(201).json({
      message: "Reply created successfully",
      reply,
    });
  } catch (error) {
    console.error("Create reply error:", error);
    res.status(500).json({ error: "Failed to create reply" });
  }
};

// Update Reply
const updateReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const { text } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // Check if reply exists and belongs to user
    const existingReply = await prisma.reply.findUnique({
      where: { id: parseInt(replyId) },
    });

    if (!existingReply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    if (existingReply.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this reply" });
    }

    const reply = await prisma.reply.update({
      where: { id: parseInt(replyId) },
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
          },
        },
      },
    });

    res.status(200).json({
      message: "Reply updated successfully",
      reply,
    });
  } catch (error) {
    console.error("Update reply error:", error);
    res.status(500).json({ error: "Failed to update reply" });
  }
};

// Delete Reply
const deleteReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const userId = req.user.userId || req.user.id;

    // Check if reply exists and belongs to user
    const existingReply = await prisma.reply.findUnique({
      where: { id: parseInt(replyId) },
    });

    if (!existingReply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    if (existingReply.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this reply" });
    }

    await prisma.reply.delete({
      where: { id: parseInt(replyId) },
    });

    res.status(200).json({
      message: "Reply deleted successfully",
    });
  } catch (error) {
    console.error("Delete reply error:", error);
    res.status(500).json({ error: "Failed to delete reply" });
  }
};

// Get Replies by Comment (with pagination)
const getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;
    const userId = req.user.userId || req.user.id;

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const [replies, totalElements] = await Promise.all([
      prisma.reply.findMany({
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
            },
          },
        },
      }),
      prisma.reply.count({
        where: {
          commentId: parseInt(commentId),
        },
      }),
    ]);

    // Map replies to add isLiked field
    const repliesWithLikeStatus = replies.map((reply) => ({
      ...reply,
      isLiked: reply.likes && reply.likes.length > 0,
      likes: undefined, // Remove likes array from response
    }));

    const totalPages = Math.ceil(totalElements / size);

    res.status(200).json({
      content: repliesWithLikeStatus,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 1,
      last: page === totalPages,
    });
  } catch (error) {
    console.error("Get comment replies error:", error);
    res.status(500).json({ error: "Failed to fetch replies" });
  }
};
// Get Single Reply
const getReply = async (req, res) => {
  try {
    const { replyId } = req.params;

    const reply = await prisma.reply.findUnique({
      where: { id: parseInt(replyId) },
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
        comment: {
          select: {
            id: true,
            text: true,
            postId: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Get reply error:", error);
    res.status(500).json({ error: "Failed to fetch reply" });
  }
};

// Like Reply (Toggle)
const likeReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const userId = req.user.userId || req.user.id;

    // Check if reply exists
    const reply = await prisma.reply.findUnique({
      where: { id: parseInt(replyId) },
    });

    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    // Check if already liked
    const existingLike = await prisma.replyLike.findFirst({
      where: {
        userId,
        replyId: parseInt(replyId),
      },
    });

    if (existingLike) {
      // Unlike (remove like)
      await prisma.replyLike.delete({
        where: { id: existingLike.id },
      });

      return res.status(200).json({
        message: "Reply unliked successfully",
        liked: false,
      });
    } else {
      // Like
      await prisma.replyLike.create({
        data: {
          userId,
          replyId: parseInt(replyId),
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

      // Create notification for reply owner
      await createNotification({
        userId: reply.userId, // Reply owner receives the notification
        triggeredByUserId: userId, // Current user who liked the reply
        type: "LIKE",
        title: "New Like",
        message: `${displayName} liked your reply`,
        referenceId: reply.id,
      });

      return res.status(201).json({
        message: "Reply liked successfully",
        liked: true,
      });
    }
  } catch (error) {
    console.error("Like reply error:", error);
    res.status(500).json({ error: "Failed to like/unlike reply" });
  }
};

// Get Reply Likes (Who liked the reply - with pagination)
const getReplyLikes = async (req, res) => {
  try {
    const { replyId } = req.params;
    const currentUserId = req.user.userId || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;

    // Check if reply exists
    const reply = await prisma.reply.findUnique({
      where: { id: parseInt(replyId) },
    });

    if (!reply) {
      return res.status(404).json({ error: "Reply not found" });
    }

    const [likes, totalElements] = await Promise.all([
      prisma.replyLike.findMany({
        where: {
          replyId: parseInt(replyId),
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
      prisma.replyLike.count({
        where: {
          replyId: parseInt(replyId),
        },
      }),
    ]);

    // Get all user IDs who liked the reply
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
    console.error("Get reply likes error:", error);
    res.status(500).json({ error: "Failed to fetch reply likes" });
  }
};

module.exports = {
  createReply,
  updateReply,
  deleteReply,
  getCommentReplies,
  getReply,
  likeReply,
  getReplyLikes,
};

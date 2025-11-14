const prisma = require("../config/db");

// Create Story
const createStory = async (req, res) => {
  try {
    const { mediaUrl } = req.body;
    const userId = parseInt(req.user.userId || req.user.id);

    // Validate userId
    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (!mediaUrl) {
      return res.status(400).json({ error: "Media URL is required" });
    }

    // Set expiration to 24 hours from now
    const expiredAt = new Date();
    expiredAt.setHours(expiredAt.getHours() + 24);

    const story = await prisma.story.create({
      data: {
        mediaUrl,
        expiredAt,
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
      },
    });

    res.status(201).json(story);
  } catch (error) {
    console.error("Create story error:", error);
    res.status(500).json({ error: "Failed to create story" });
  }
};

// Delete Story
const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id || req.user.id;

    // Check if story exists and belongs to user
    const story = await prisma.story.findUnique({
      where: { id: parseInt(storyId) },
    });

    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }

    if (story.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this story" });
    }

    await prisma.story.delete({
      where: { id: parseInt(storyId) },
    });

    res.status(200).json({ message: "Story deleted successfully" });
  } catch (error) {
    console.error("Delete story error:", error);
    res.status(500).json({ error: "Failed to delete story" });
  }
};

// Get All Stories from Following Users (grouped by user)
const getFollowingStories = async (req, res) => {
  try {
    const userId = req.user.id || req.user.id;

    // Get all users that the current user is following
    const following = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });

    const followingIds = following.map((f) => f.followingId);

    // Include the current user's stories as well
    followingIds.push(userId);

    // Get all non-expired stories from following users
    const stories = await prisma.story.findMany({
      where: {
        userId: {
          in: followingIds,
        },
        expiredAt: {
          gt: new Date(), // Only get stories that haven't expired
        },
      },
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
    });

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
      const userId = story.user.id;

      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: [],
        };
      }

      acc[userId].stories.push({
        id: story.id,
        mediaUrl: story.mediaUrl,
        expiredAt: story.expiredAt,
        createdDate: story.createdDate,
      });

      return acc;
    }, {});

    // Convert to array and sort by most recent story
    const result = Object.values(groupedStories).sort((a, b) => {
      const latestA = new Date(a.stories[0].createdDate);
      const latestB = new Date(b.stories[0].createdDate);
      return latestB - latestA;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Get following stories error:", error);
    res.status(500).json({ error: "Failed to fetch stories" });
  }
};

// Get User Stories
const getUserStories = async (req, res) => {
  try {
    const { userId } = req.params;

    const stories = await prisma.story.findMany({
      where: {
        userId: parseInt(userId),
        expiredAt: {
          gt: new Date(), // Only get non-expired stories
        },
      },
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
    });

    res.status(200).json(stories);
  } catch (error) {
    console.error("Get user stories error:", error);
    res.status(500).json({ error: "Failed to fetch user stories" });
  }
};

// Delete Expired Stories (called by cron job)
const deleteExpiredStories = async () => {
  try {
    const result = await prisma.story.deleteMany({
      where: {
        expiredAt: {
          lte: new Date(), // Delete stories where expiredAt is less than or equal to now
        },
      },
    });

    console.log(`Deleted ${result.count} expired stories`);
    return result;
  } catch (error) {
    console.error("Delete expired stories error:", error);
    throw error;
  }
};

module.exports = {
  createStory,
  deleteStory,
  getFollowingStories,
  getUserStories,
  deleteExpiredStories,
};

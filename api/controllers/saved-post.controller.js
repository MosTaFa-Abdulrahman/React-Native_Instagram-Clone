const prisma = require("../config/db");

// Save a Post
const savePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id || req.user.id;

    // Check if post exists
    const postExists = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!postExists) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if already saved
    const existingSave = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId: parseInt(postId),
        },
      },
    });

    if (existingSave) {
      return res.status(400).json({ error: "Post already saved" });
    }

    // Create saved post
    const savedPost = await prisma.savedPost.create({
      data: {
        userId,
        postId: parseInt(postId),
      },
      include: {
        post: {
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
        },
      },
    });

    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Save post error:", error);
    res.status(500).json({ error: "Failed to save post" });
  }
};

// Unsave a Post (Delete)
const unsavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id || req.user.id;

    // Check if saved post exists
    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId,
          postId: parseInt(postId),
        },
      },
    });

    if (!savedPost) {
      return res.status(404).json({ error: "Saved post not found" });
    }

    // Delete saved post
    await prisma.savedPost.delete({
      where: {
        userId_postId: {
          userId,
          postId: parseInt(postId),
        },
      },
    });

    res.status(200).json({ message: "Post unsaved successfully" });
  } catch (error) {
    console.error("Unsave post error:", error);
    res.status(500).json({ error: "Failed to unsave post" });
  }
};

// Get All Saved Posts for a User (with pagination)
const getSavedPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;

    // Verify userId matches authenticated user
    if (req.user.id !== parseInt(userId)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const [savedPosts, totalElements] = await Promise.all([
      prisma.savedPost.findMany({
        where: {
          userId: parseInt(userId),
        },
        skip,
        take: size,
        orderBy: {
          createdDate: "desc",
        },
        include: {
          post: {
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
          },
        },
      }),
      prisma.savedPost.count({
        where: {
          userId: parseInt(userId),
        },
      }),
    ]);

    const totalPages = Math.ceil(totalElements / size);

    // Transform response to match the expected format
    const content = savedPosts.map((savedPost) => ({
      ...savedPost.post,
      savedAt: savedPost.createdDate,
      savedPostId: savedPost.id,
    }));

    res.status(200).json({
      content,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 1,
      last: page === totalPages,
    });
  } catch (error) {
    console.error("Get saved posts error:", error);
    res.status(500).json({ error: "Failed to fetch saved posts" });
  }
};

module.exports = {
  savePost,
  unsavePost,
  getSavedPosts,
};

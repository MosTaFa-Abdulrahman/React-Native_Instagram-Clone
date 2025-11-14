const prisma = require("../config/db");

// Create Notification (Helper function - used internally)
const createNotification = async ({
  userId,
  triggeredByUserId,
  type,
  title,
  message,
  referenceId = null,
}) => {
  try {
    // Don't create notification if user is triggering action on their own content
    if (userId === triggeredByUserId) {
      return null;
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        triggeredByUserId,
        type,
        title,
        message,
        referenceId,
      },
      include: {
        triggeredByUser: {
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

    return notification;
  } catch (error) {
    console.error("Create notification error:", error);
    throw error;
  }
};

// Get All Notifications for User (with pagination)
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user.id;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 20;
    const skip = (page - 1) * size;

    const [notifications, totalElements] = await Promise.all([
      prisma.notification.findMany({
        where: {
          userId,
        },
        skip,
        take: size,
        orderBy: {
          createdDate: "desc",
        },
        include: {
          triggeredByUser: {
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
      prisma.notification.count({
        where: {
          userId,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalElements / size);

    res.status(200).json({
      content: notifications,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 1,
      last: page === totalPages,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

// Get Unread Notifications Count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id || req.user.id;

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    res.status(200).json({ unreadCount: count });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
};

// Mark Notification as Read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id || req.user.id;

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(notificationId) },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this notification" });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: parseInt(notificationId) },
      data: { isRead: true },
      include: {
        triggeredByUser: {
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

    res.status(200).json(updatedNotification);
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

// Mark All Notifications as Read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user.id;

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};

// Delete Notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findUnique({
      where: { id: parseInt(notificationId) },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this notification" });
    }

    await prisma.notification.delete({
      where: { id: parseInt(notificationId) },
    });

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
};

// Delete All Notifications
const deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notification.deleteMany({
      where: {
        userId,
      },
    });

    res.status(200).json({ message: "All notifications deleted successfully" });
  } catch (error) {
    console.error("Delete all notifications error:", error);
    res.status(500).json({ error: "Failed to delete all notifications" });
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};

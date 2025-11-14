const router = require("express").Router();
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} = require("../controllers/notification.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Get Notifications
router.get("/", authenticate, getUserNotifications);
router.get("/unread-count", authenticate, getUnreadCount);

// Mark as Read
router.patch("/:notificationId/read", authenticate, markAsRead);
router.patch("/mark-all-read", authenticate, markAllAsRead);

// Delete Notifications
router.delete("/:notificationId", authenticate, deleteNotification);
router.delete("/", authenticate, deleteAllNotifications);

module.exports = router;

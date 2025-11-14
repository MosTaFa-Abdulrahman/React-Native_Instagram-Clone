const router = require("express").Router();
const {
  createReply,
  updateReply,
  deleteReply,
  getCommentReplies,
  getReply,
  likeReply,
  getReplyLikes,
} = require("../controllers/reply.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Reply CRUD Operations
router.post("/", authenticate, createReply);
router.get("/:replyId", authenticate, getReply);
router.patch("/:replyId", authenticate, updateReply);
router.delete("/:replyId", authenticate, deleteReply);

// Get Replies by Comment
router.get("/comment/:commentId", authenticate, getCommentReplies);

// Like Operations
router.post("/:replyId/like", authenticate, likeReply);
router.get("/:replyId/likes", authenticate, getReplyLikes);

module.exports = router;

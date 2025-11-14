const router = require("express").Router();
const {
  createComment,
  updateComment,
  deleteComment,
  getPostComments,
  getComment,
  likeComment,
  getCommentLikes,
} = require("../controllers/comment.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Comment CRUD Operations
router.post("/", authenticate, createComment);
router.get("/:commentId", authenticate, getComment);
router.patch("/:commentId", authenticate, updateComment);
router.delete("/:commentId", authenticate, deleteComment);

// Get Comments by Post
router.get("/post/:postId", authenticate, getPostComments);

// Like Operations
router.post("/:commentId/like", authenticate, likeComment);
router.get("/:commentId/likes", authenticate, getCommentLikes);

module.exports = router;

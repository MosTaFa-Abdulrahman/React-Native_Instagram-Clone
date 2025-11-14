const router = require("express").Router();
const {
  createPost,
  updatePost,
  deletePost,
  getAllPosts,
  getUserPosts,
  getPost,
  likePost,
  getPostLikes,
} = require("../controllers/post.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Post CRUD Operations
router.post("/", authenticate, createPost);
router.get("/", authenticate, getAllPosts);
router.get("/:postId", authenticate, getPost);
router.patch("/:postId", authenticate, updatePost);
router.delete("/:postId", authenticate, deletePost);

// Get Posts by User
router.get("/user/:userId", authenticate, getUserPosts);

// Like Operations
router.post("/:postId/like", authenticate, likePost);
router.get("/:postId/likes", authenticate, getPostLikes);

module.exports = router;

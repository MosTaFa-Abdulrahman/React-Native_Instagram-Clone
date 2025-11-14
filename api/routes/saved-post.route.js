const router = require("express").Router();
const {
  savePost,
  unsavePost,
  getSavedPosts,
} = require("../controllers/saved-post.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Save/Unsave Operations
router.post("/:postId", authenticate, savePost);
router.delete("/:postId", authenticate, unsavePost);

// Get Saved Posts by User
router.get("/user/:userId", authenticate, getSavedPosts);

module.exports = router;

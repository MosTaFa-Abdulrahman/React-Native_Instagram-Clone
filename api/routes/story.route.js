const router = require("express").Router();
const {
  createStory,
  deleteStory,
  getFollowingStories,
  getUserStories,
} = require("../controllers/story.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// Story CRUD Operations
router.post("/", authenticate, createStory);
router.delete("/:storyId", authenticate, deleteStory);

// Get Stories
router.get("/following", authenticate, getFollowingStories);
router.get("/user/:userId", authenticate, getUserStories);

module.exports = router;

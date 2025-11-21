const router = require("express").Router();
const {
  getAllUsers,
  getUserProfile,
  updateUser,
  deleteUser,
  followUser,
  getUserFollowers,
  getUserFollowing,
  getSuggestedUsers,
} = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// User Profile Operations
router.get("/", authenticate, getAllUsers);
router.get("/suggested", authenticate, getSuggestedUsers);
router.get("/:userId", authenticate, getUserProfile);
router.patch("/me", authenticate, updateUser);
router.delete("/me", authenticate, deleteUser);

// Follow Operations
router.post("/:userId/follow", authenticate, followUser);
router.get("/:userId/followers", authenticate, getUserFollowers);
router.get("/:userId/following", authenticate, getUserFollowing);

module.exports = router;

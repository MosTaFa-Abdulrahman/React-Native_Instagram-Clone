const router = require("express").Router();
const {
  register,
  login,
  logout,
  getProfile,
} = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", authenticate, getProfile);

module.exports = router;

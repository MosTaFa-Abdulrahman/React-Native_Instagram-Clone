const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

// Config
const prisma = require("./config/db");
const { startStoryCleanupJob } = require("./config/storyCron");

// Routes
const authRoute = require("./routes/auth.route");
const usersRoute = require("./routes/user.route");
const postsRoute = require("./routes/post.route");
const commentsRoute = require("./routes/comment.route");
const repliesRoute = require("./routes/reply.route");
const savedPostsRoute = require("./routes/saved-post.route");
const storiesRoute = require("./routes/story.route");
const notificationsRoute = require("./routes/notification.route");

// Express Usages
dotenv.config();
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
const corsOptions = {
  origin: ["http://localhost:8081"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Database Config
app.get("/", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ message: "Server and database connected successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Database connection failed", details: error.message });
  }
});

// MiddleWares
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/posts", postsRoute);
app.use("/api/comments", commentsRoute);
app.use("/api/replies", repliesRoute);
app.use("/api/saved-posts", savedPostsRoute);
app.use("/api/stories", storiesRoute);
app.use("/api/notifications", notificationsRoute);

// Start Cron Jobs
startStoryCleanupJob();

app.listen(PORT, () => console.log(`Server Running on PORT ${PORT} 🥰`));

const cron = require("node-cron");
const prisma = require("../config/db");

// Delete expired stories function
const deleteExpiredStories = async () => {
  try {
    const result = await prisma.story.deleteMany({
      where: {
        expiredAt: {
          lte: new Date(), // Delete stories where expiredAt is less than or equal to now
        },
      },
    });

    if (result.count > 0) {
      console.log(
        `✅ Deleted ${
          result.count
        } expired stories at ${new Date().toISOString()}`
      );
    }

    return result;
  } catch (error) {
    console.error("❌ Delete expired stories error:", error);
    throw error;
  }
};

// Start cron job to delete expired stories every hour
const startStoryCleanupJob = () => {
  // Cron schedule: "0 * * * *" means run at minute 0 of every hour
  // Examples of other schedules:
  // "*/30 * * * *"  - Every 30 minutes
  // "*/10 * * * *"  - Every 10 minutes
  // "0 */2 * * *"   - Every 2 hours
  // "0 0 * * *"     - Once a day at midnight

  cron.schedule("0 * * * *", async () => {
    console.log("🧹 Running story cleanup job...");
    try {
      await deleteExpiredStories();
    } catch (error) {
      console.error("❌ Story cleanup failed:", error);
    }
  });

  console.log(
    "⏰ Story cleanup cron job scheduled (runs every hour at minute 0)"
  );

  // Optional: Run cleanup immediately on server start to clean existing expired stories
  console.log("🚀 Running initial cleanup on server start...");
  deleteExpiredStories().catch((error) => {
    console.error("❌ Initial cleanup failed:", error);
  });
};

module.exports = {
  startStoryCleanupJob,
  deleteExpiredStories,
};

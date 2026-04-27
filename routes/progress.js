const express = require("express");
const Progress = require("../models/Progress");
const User = require("../models/User");
const protect = require("../middleware/auth");
const router = express.Router();

// Get all progress for user
router.get("/", protect, async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user._id });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get progress for specific lesson
router.get("/:lessonId", protect, async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.user._id,
      lessonId: req.params.lessonId,
    });
    res.json(progress || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update/create section progress
router.post("/update", protect, async (req, res) => {
  const { lessonId, level, day, section, quizScore } = req.body;
  try {
    let progress = await Progress.findOne({ user: req.user._id, lessonId });

    if (!progress) {
      progress = new Progress({ user: req.user._id, lessonId, level, day });
    }

    if (section) progress.completedSections[section] = true;
    if (quizScore !== undefined) progress.quizScore = quizScore;

    // Check if all sections completed
    const sections = Object.values(progress.completedSections);
    if (sections.every(Boolean)) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      progress.xpEarned = 50;

      // Update user XP and level
      const user = await User.findById(req.user._id);
      user.totalXP += 50;
      // Level up every 3 completed lessons
      const totalCompleted = await Progress.countDocuments({
        user: req.user._id,
        isCompleted: true,
      });
      user.currentLevel = Math.floor(totalCompleted / 3);
      await user.save();
    }

    await progress.save();
    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get overall stats
router.get("/stats/overview", protect, async (req, res) => {
  try {
    const allProgress = await Progress.find({ user: req.user._id });
    const completed = allProgress.filter((p) => p.isCompleted).length;
    const inProgress = allProgress.filter((p) => !p.isCompleted).length;

    res.json({
      totalLessons: allProgress.length,
      completed,
      inProgress,
      totalXP: req.user.totalXP,
      streak: req.user.streak,
      currentLevel: req.user.currentLevel,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

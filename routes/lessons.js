const express = require("express");
const router = express.Router();
const learningData = require("../data/spokenLevel/index");

router.get("/", (req, res) => {
  const summary = learningData.levels.map((level) => ({
    levelId: level.levelId,
    levelName: level.levelName,
    emoji: level.emoji,
    days: level.days.length,
  }));
  const totalDays = summary.reduce((sum, lvl) => sum + lvl.days, 0);
  res.json({ summary, totalDays });
});

router.get("/total", (req, res) => {
  const beginnerDays =
    learningData.levels.find((l) => l.levelId === 0)?.days.length || 0;
  const intermediateDays =
    learningData.levels.find((l) => l.levelId === 1)?.days.length || 0;
  const advancedDays =
    learningData.levels.find((l) => l.levelId === 2)?.days.length || 0;

  const totalDays = learningData.levels.reduce(
    (sum, level) => sum + level.days.length,
    0,
  );
  res.json({ beginnerDays, intermediateDays, advancedDays, totalDays });
});

router.get("/:levelId/:day", (req, res) => {
  const { levelId, day } = req.params;
  const level = learningData.levels.find(
    (l) => l.levelId === parseInt(levelId),
  );
  if (!level) return res.status(404).json({ message: "Level not found" });

  const dayData = level.days.find((d) => d.day === parseInt(day));
  if (!dayData) return res.status(404).json({ message: "Day not found" });

  res.json({ levelName: level.levelName, ...dayData });
});

module.exports = router;

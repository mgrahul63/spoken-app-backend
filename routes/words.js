const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/auth");
const learningWords = require("../data/words/index.js");
const router = express.Router();

// Get all words from json file
router.get("/", protect, async (req, res) => {
  try {
    res.json(learningWords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

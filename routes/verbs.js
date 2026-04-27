const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/auth");
const learningVerbs = require("../data/verbs/index.js");
const router = express.Router();

// Get all verbs from json file
router.get("/", protect, async (req, res) => {
  try {
    res.json(learningVerbs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const protect = require("../middleware/auth");
const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, streak: user.streak, totalXP: user.totalXP, currentLevel: user.currentLevel },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(400).json({ message: "Invalid email or password" });

    // Streak logic
    const today = new Date().setHours(0, 0, 0, 0);
    const lastLogin = user.lastLoginDate
      ? new Date(user.lastLoginDate).setHours(0, 0, 0, 0)
      : null;
    const yesterday = today - 86400000;

    if (lastLogin === yesterday) user.streak += 1;
    else if (lastLogin !== today) user.streak = 1;
    user.lastLoginDate = new Date();
    await user.save();

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, streak: user.streak, totalXP: user.totalXP, currentLevel: user.currentLevel },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get profile
router.get("/me", protect, async (req, res) => {
  res.json({
    user: { id: req.user._id, name: req.user.name, email: req.user.email, streak: req.user.streak, totalXP: req.user.totalXP, currentLevel: req.user.currentLevel },
  });
});

module.exports = router;

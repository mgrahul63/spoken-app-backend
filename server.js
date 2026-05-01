const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

/* ---------------- CORS CONFIG ---------------- */

const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  }),
);

/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json());

/* ---------------- MONGODB CONNECTION (Serverless safe) ---------------- */

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("✅ MongoDB Connected");
}

// Connect on every request (cached after first time)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    res.status(500).json({ message: "Database connection failed" });
  }
});

/* ---------------- HEALTH CHECK ---------------- */

app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

/* ---------------- ROUTES ---------------- */

app.use("/api/auth", require("./routes/auth"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/lessons", require("./routes/lessons"));
app.use("/api/verbs", require("./routes/verbs"));
app.use("/api/words", require("./routes/words"));

/* ---------------- ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: "Server Error" });
});

/* ---------------- LOCAL SERVER ---------------- */

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;

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
      // allow server-to-server / mobile apps / postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
  }),
);

/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json());

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

/* ---------------- MONGODB ---------------- */

mongoose.connect(process.env.MONGO_URI);

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB Connected");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB Error:", err);
});

/* ---------------- ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: "Server Error" });
});

/* ---------------- START SERVER (local only) ---------------- */

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

/* ---------------- VERCEL SERVERLESS EXPORT ---------------- */

module.exports = app;

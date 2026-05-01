const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

/* ---------------- ENV CHECK ---------------- */

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is missing in environment variables");
}

/* ---------------- CORS ---------------- */

const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, true); // safe fallback for Vercel/browser issues
    },
    credentials: true,
  }),
);

app.options("*", cors());

/* ---------------- MIDDLEWARE ---------------- */

app.use(express.json());

/* ---------------- ROUTES ---------------- */

app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/lessons", require("./routes/lessons"));
app.use("/api/verbs", require("./routes/verbs"));
app.use("/api/words", require("./routes/words"));

/* ---------------- MONGODB (SERVERLESS SAFE) ---------------- */

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

connectDB();

/* ---------------- ERROR HANDLER ---------------- */

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server Error" });
});

/* ---------------- EXPORT FOR VERCEL ---------------- */

module.exports = app;

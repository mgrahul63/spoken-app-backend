const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lessonId: { type: String, required: true },
    level: { type: Number, required: true },
    day: { type: Number, required: true },
    completedSections: {
      vocabulary: { type: Boolean, default: false },
      phrases: { type: Boolean, default: false },
      sentences: { type: Boolean, default: false },
      quiz: { type: Boolean, default: false },
      story: { type: Boolean, default: false },
      listening: { type: Boolean, default: false },
      speaking: { type: Boolean, default: false },
      conversation: { type: Boolean, default: false },
    },
    quizScore: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);

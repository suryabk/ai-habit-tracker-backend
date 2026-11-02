import mongoose from "mongoose";

export const HABIT_CATEGORIES = [
  "Health",
  "Fitness",
  "Learning",
  "Mindfulness",
  "Productivity",
  "Social",
  "Finance",
  "Creative",
  "Work",
  "Other",
];

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      enum: HABIT_CATEGORIES,
      default: "Other",
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "daily",
    },
    targetDays: {
      type: Number,
      default: 1,
      min: 1,
      max: 31,
    },
    color: { type: String, default: "#6366f1" },
    icon: { type: String, default: "Target" },
    isArchived: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Habit", habitSchema);

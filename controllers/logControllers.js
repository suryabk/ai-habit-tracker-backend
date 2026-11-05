import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import {
  calcStreak,
  last90days,
  lastNDays,
  todayKey,
} from "../utils/dateHelpers.js";

export const markComplete = async (req, res) => {
  try {
    const { habitId, date } = req.body;
    const completedDate = date || todayKey();
    const habit = await Habit.findOne({ _id: habitId, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const log = await HabitLog.findOneAndUpdate(
      {
        userId: req.user._id,
        habitId,
        completedDate,
      },
      { $setOnInsert: { userId: req.user._id, habitId, completedDate } },
      { upsert: true, returnDocument: "after" },
    );

    res.status(200).json({ data: log });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to mark date as complete" });
  }
};

export const unmarkComplete = async (req, res) => {
  try {
    const { habitId, date } = req.body;
    const completedDate = date || todayKey();
    const log = await HabitLog.findOneAndDelete({
      userId: req.user._id,
      habitId,
      completedDate,
    });
    if (!log) {
      return res.status(404).json({ message: "Date not found" });
    }
    res.status(200).json({ data: log, message: "Unmarked" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to unmark date" });
  }
};

export const getToday = async (req, res) => {
  try {
    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: todayKey(),
    });
    res
      .status(200)
      .json({ data: logs, message: "Today logs fetched successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get today logs" });
  }
};

export const getRange = async (req, res) => {
  try {
    const { start, end } = req.query;
    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: { $gte: start, $lte: end },
    });
    res.status(200).json({ data: logs, message: "Range logs fetched" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get range logs" });
  }
};

export const getHeatmap = async (req, res) => {
  try {
    const days = last90days();
    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: { $gte: days[0], $lte: days[days.length - 1] },
    });

    const counts = {};
    for (const d of days) {
      counts[d] = 0;
    }
    for (const l of logs) {
      counts[l.completedDate] = (counts[l.completedDate] || 0) + 1;
    }

    const data = days.map((d) => ({ date: d, count: counts[d] || 0 }));
    res.status(200).json({ data, message: "Heatmap fetched successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get heatmap" });
  }
};

export const getHabitStats = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.habitId,
      userId: req.user._id,
    });
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    const logs = await HabitLog.find({
      userId: req.user._id,
      habitId: habit._id,
    }).sort({ completedDate: -1 });

    const dateKeys = logs.map((l) => l.completedDate);
    const { current, longest } = calcStreak(dateKeys);

    // completion rate since habit created
    const createdKey = habit.createdAt.toISOString().slice(0, 10);
    const today = todayKey();
    const start = new Date(createdKey);
    const end = new Date(today);
    const totalDays =
      Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24))) + 1;
    const completionRate = Math.round((logs.length / totalDays) * 100);

    // monthly breakdown (last 6 months)
    const monthly = {};
    for (const l of logs) {
      const m = l.completedDate.slice(0, 7);
      monthly[m] = (monthly[m] || 0) + 1;
    }

    res.status(200).json({
      habit,
      totalCompletions: logs.length,
      currentStreak: current,
      longestStreak: longest,
      completionRate,
      monthly,
      message: "Habit stats fetched successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get habit stats" });
  }
};

export const getAllStats = async (req, res) => {
  try {
    const habits = await Habit.find({
      userId: req.user._id,
      isArchived: false,
    });
    const days = lastNDays(30);
    const logs = await HabitLog.find({
      userId: req.user._id,
      completedDate: { $gte: days[0], $lte: days[days.length - 1] },
    });

    const perHabit = habits.map((h) => {
      const hLogs = logs.filter((l) => String(l.habitId) === String(h._id));
      const keys = hLogs
        .map((l) => l.completedDate)
        .sort()
        .reverse();
      const { current, longest } = calcStreak(keys);
      return {
        habitId: h._id,
        name: h.name,
        icon: h.icon,
        color: h.color,
        category: h.category,
        completions30d: hLogs.length,
        currentStreak: current,
        longestStreak: longest,
      };
    });

    res
      .status(200)
      .json({ data: { perHabit, days }, message: "All stats fetched" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get all stats" });
  }
};

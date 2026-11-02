import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";

export const getHabits = async (req, res) => {
  try {
    const { includedArchived } = req.query;

    const filter = { userId: req.user.id };

    if (!includedArchived) {
      filter.isArchived = false;
    }
    const habits = await Habit.find(filter).sort({
      order: 1,
      createdAt: 1,
    });
    res
      .status(200)
      .json({ data: habits, message: "Habits fetched successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch habits" });
  }
};

export const createHabit = async (req, res) => {
  try {
    const { name, description, category, frequency, targetDays, color, icon } =
      req.body;

    if (!name) {
      return res.status(400).json({ message: "Habit name is required" });
    }
    const count = await Habit.countDocuments({ userId: req.user._id });

    const habit = await Habit.create({
      userId: req.user._id,
      name,
      description,
      category,
      frequency,
      targetDays,
      color,
      icon,
      order: count,
    });

    res
      .status(201)
      .json({ data: habit, message: "Habit created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create habit" });
  }
};

export const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    const fields = [
      "name",
      "description",
      "category",
      "frequency",
      "targetDays",
      "color",
      "icon",
      "order",
    ];
    for (const field of fields) {
      if (req.body[field]) {
        habit[field] = req.body[field];
      }
    }

    await habit.save();
    res
      .status(200)
      .json({ data: habit, message: "Habit updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update habit" });
  }
};

export const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    await HabitLog.deleteMany({ habitId: habit._id, userId: req.user._id });
    res.status(200).json({ message: "Habit deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete habit" });
  }
};

export const archiveHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }
    habit.isArchived = true;
    const updatedHabit = await habit.save();
    res
      .status(200)
      .json({ data: updatedHabit, message: "Habit archived successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to archive habit" });
  }
};

export const reorderHabits = async (req, res) => {
  try {
    const { order } = req.body; // Array of habit IDs in new order
    if (!Array.isArray(order)) {
      return res.status(400).json({ message: "Order must be an array" });
    }
    const updatedHabits = await Promise.all(
      order.map(async (habitId, index) => {
        const habit = await Habit.findOne(
          { _id: habitId, userId: req.user._id },
          { $set: { order: index } },
        );
        return habit;
      }),
    );

    const allMatched = updatedHabits.every((h) => h.matchedCount === 1);

    if (!allMatched) {
      return res.status(404).json({
        message: "Some habits were not found",
      });
    }

    res.status(200).json({ message: "Reordered" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to reorder habits" });
  }
};

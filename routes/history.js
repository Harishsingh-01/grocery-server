const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Family = require("../models/Family");
const ShoppingList = require("../models/ShoppingList");
const Item = require("../models/Item");
const HistoryModel = require("../models/History");

// GET /api/history/frequent?familyCode=... - Returns top frequently added items across ALL lists
router.get("/frequent", async (req, res, next) => {
  try {
    const { familyCode } = req.query;

    if (!familyCode || familyCode.length !== 6) {
      return res.status(400).json({ error: "Invalid family code" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    // Get ALL lists for this family (active + completed — no filter)
    const allLists = await ShoppingList.find({
      familyId: family._id
    }).lean();

    if (allLists.length === 0) {
      return res.json({ frequentItems: [] });
    }

    const allListIds = allLists.map((l) => l._id);

    // Get ALL items ever added to any list (regardless of isPurchased or list status)
    const allItems = await Item.find({
      familyId: family._id,
      listId: { $in: allListIds }
    }).populate("categoryId").lean();

    if (allItems.length === 0) {
      return res.json({ frequentItems: [] });
    }

    // Count frequency of each item by normalized name
    const frequencyMap = {};
    allItems.forEach((item) => {
      const key = item.name.toLowerCase().trim();
      if (!frequencyMap[key]) {
        frequencyMap[key] = {
          name: item.name,
          count: 0,
          unit: item.unit,
          quantity: item.quantity,
          categoryId: item.categoryId,
          estimatedCost: item.estimatedCost || 0
        };
      }
      frequencyMap[key].count += 1;
    });

    // Sort by frequency descending, return top 20
    // Only show items added to more than 1 list (genuinely frequent)
    const frequentItems = Object.values(frequencyMap)
      .filter((item) => item.count >= 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return res.json({ frequentItems });
  } catch (error) {
    next(error);
  }
});

// GET /api/history?familyCode=...
router.get("/", async (req, res, next) => {
  try {
    const { familyCode } = req.query;

    if (!familyCode || familyCode.length !== 6) {
      return res.status(400).json({ error: "Invalid family code" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    const logs = await HistoryModel.find({ familyId: family._id })
      .populate("listId")
      .sort({ completedAt: -1 });

    return res.json({ logs });
  } catch (error) {
    next(error);
  }
});

// POST /api/history - Action: complete, duplicate, restore, repeat
router.post("/", async (req, res, next) => {
  try {
    const { familyCode, listId, action } = req.body;

    if (!familyCode || !listId || !action) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    // Action 1: Complete List
    if (action === "complete") {
      const list = await ShoppingList.findOne({ _id: listId, familyId: family._id });
      if (!list) {
        return res.status(404).json({ error: "List not found" });
      }

      list.isCompleted = true;
      list.completedAt = new Date();
      await list.save();

      // Gather item stats for history log
      const listItems = await Item.find({ listId: list._id, familyId: family._id });
      const boughtItems = listItems.filter((i) => i.isPurchased);
      const itemsListStr = boughtItems.slice(0, 5).map((i) => i.name).join(", ");
      const summary = boughtItems.length > 5 
        ? `Bought ${itemsListStr}, and ${boughtItems.length - 5} other items`
        : boughtItems.length > 0 ? `Bought ${itemsListStr}` : "No items purchased";

      // Create history log
      const newHistoryLog = new HistoryModel({
        familyId: family._id,
        listId: list._id,
        completedAt: list.completedAt,
        itemsCount: listItems.length,
        summary
      });
      await newHistoryLog.save();

      return res.json({ success: true, log: newHistoryLog });
    }

    // Action 2: Duplicate list
    if (action === "duplicate") {
      const sourceList = await ShoppingList.findOne({ _id: listId, familyId: family._id }).lean();
      if (!sourceList) {
        return res.status(404).json({ error: "Source list not found" });
      }

      const newListId = new mongoose.Types.ObjectId();
      const duplicatedList = new ShoppingList({
        _id: newListId,
        familyId: family._id,
        name: `${sourceList.name} (Copy)`,
        type: sourceList.type === "today" ? "custom" : sourceList.type,
        status: "active",
        isCompleted: false
      });
      await duplicatedList.save();

      const sourceItems = await Item.find({ listId: sourceList._id, familyId: family._id }).lean();
      const copiedItems = sourceItems.map((item) => ({
        familyId: family._id,
        listId: newListId,
        categoryId: item.categoryId,
        subcategory: item.subcategory,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes || "",
        isPurchased: false,
        isFavorite: item.isFavorite || false
      }));

      if (copiedItems.length > 0) {
        await Item.insertMany(copiedItems);
      }

      return res.json({ success: true, list: duplicatedList });
    }

    // Action 3: Restore list
    if (action === "restore") {
      const list = await ShoppingList.findOne({ _id: listId, familyId: family._id });
      if (!list) {
        return res.status(404).json({ error: "List not found" });
      }

      list.isCompleted = false;
      list.completedAt = undefined;
      await list.save();

      await Item.updateMany({ listId: list._id, familyId: family._id }, { isPurchased: false });
      await HistoryModel.deleteOne({ listId: list._id, familyId: family._id });

      return res.json({ success: true, list });
    }

    // Action 4: Repeat List
    if (action === "repeat") {
      const sourceItems = await Item.find({ listId, familyId: family._id }).lean();
      if (sourceItems.length === 0) {
        return res.status(404).json({ error: "No items to repeat" });
      }

      let activeList = await ShoppingList.findOne({
        familyId: family._id,
        type: "today",
        status: "active",
        isCompleted: { $ne: true }
      });

      if (!activeList) {
        activeList = new ShoppingList({
          familyId: family._id,
          name: "Today's Shopping",
          type: "today",
          status: "active",
          isCompleted: false
        });
        await activeList.save();
      }

      const newItems = sourceItems.map((item) => ({
        familyId: family._id,
        listId: activeList._id,
        categoryId: item.categoryId,
        subcategory: item.subcategory,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes || "",
        isPurchased: false,
        isFavorite: item.isFavorite || false
      }));

      if (newItems.length > 0) {
        await Item.insertMany(newItems);
      }

      return res.json({ success: true, listId: activeList._id });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/history - Clear history log(s)
router.delete("/", async (req, res, next) => {
  try {
    const { familyCode, listId, clearAll } = req.body;

    if (!familyCode) {
      return res.status(400).json({ error: "Family code is required" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    if (clearAll) {
      const completedLists = await ShoppingList.find({ familyId: family._id, isCompleted: true });
      const completedListIds = completedLists.map((l) => l._id);

      await Item.deleteMany({ listId: { $in: completedListIds }, familyId: family._id });
      await ShoppingList.deleteMany({ familyId: family._id, isCompleted: true });
      await HistoryModel.deleteMany({ familyId: family._id });

      return res.json({ success: true, clearedAll: true });
    } else {
      if (!listId) {
        return res.status(400).json({ error: "List ID is required for single deletion" });
      }

      await Item.deleteMany({ listId, familyId: family._id });
      await ShoppingList.deleteOne({ _id: listId, familyId: family._id });
      await HistoryModel.deleteOne({ listId, familyId: family._id });

      return res.json({ success: true, deleted: true });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;

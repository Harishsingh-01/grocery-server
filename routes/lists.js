const express = require("express");
const router = express.Router();
const Family = require("../models/Family");
const ShoppingList = require("../models/ShoppingList");
const Item = require("../models/Item");

// GET /api/lists?familyCode=...
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

    const lists = await ShoppingList.find({
      familyId: family._id,
      status: "active",
      isCompleted: { $ne: true }
    });

    return res.json({ lists });
  } catch (error) {
    next(error);
  }
});

// POST /api/lists - Create custom list
router.post("/", async (req, res, next) => {
  try {
    const { familyCode, name, type, _id } = req.body;

    if (!familyCode || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    const newList = new ShoppingList({
      _id: _id || undefined, // Use client ID if provided for offline sync compatibility
      familyId: family._id,
      name: name.trim(),
      type: type || "custom",
      status: "active",
      isCompleted: false
    });

    await newList.save();
    return res.status(201).json({ success: true, list: newList });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/lists - Delete shopping list and all items belonging to it
router.delete("/", async (req, res, next) => {
  try {
    const { familyCode, listId } = req.body.familyCode ? req.body : req.query;

    if (!familyCode || !listId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    await Item.deleteMany({ listId, familyId: family._id });
    const result = await ShoppingList.deleteOne({ _id: listId, familyId: family._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "List not found" });
    }

    return res.json({ success: true, deleted: true });
  } catch (error) {
    next(error);
  }
});

// GET /api/lists/share/:listId - Public share checklist data retrieval
router.get("/share/:listId", async (req, res, next) => {
  try {
    const { listId } = req.params;
    const list = await ShoppingList.findById(listId);
    if (!list) {
      return res.status(404).json({ error: "Checklist not found" });
    }
    const items = await Item.find({ listId: list._id }).populate("categoryId");
    return res.json({ list, items });
  } catch (error) {
    next(error);
  }
});

// PUT /api/lists/share/:listId/item/:itemId - Public toggle purchase status of an item
router.put("/share/:listId/item/:itemId", async (req, res, next) => {
  try {
    const { listId, itemId } = req.params;
    const { isPurchased } = req.body;

    const list = await ShoppingList.findById(listId);
    if (!list) {
      return res.status(404).json({ error: "Checklist not found" });
    }

    const item = await Item.findOne({ _id: itemId, listId: list._id });
    if (!item) {
      return res.status(404).json({ error: "Item not found in this checklist" });
    }

    item.isPurchased = !!isPurchased;
    await item.save();

    return res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

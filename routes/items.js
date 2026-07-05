const express = require("express");
const router = express.Router();
const Family = require("../models/Family");
const ShoppingList = require("../models/ShoppingList");
const Item = require("../models/Item");

// GET /api/items
router.get("/", async (req, res, next) => {
  try {
    const { familyCode, listType = "today", listId } = req.query;

    if (!familyCode || familyCode.length !== 6) {
      return res.status(400).json({ error: "Invalid family code" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    if (listId) {
      const items = await Item.find({ familyId: family._id, listId }).populate("categoryId");
      return res.json({ items, listId });
    }

    // Find list or auto-create if missing
    let list = await ShoppingList.findOne({ familyId: family._id, type: listType, status: "active" });
    if (!list) {
      const listNamesMap = {
        today: "Today's Shopping",
        weekly: "Weekly List",
        monthly: "Monthly Grocery",
        custom: "Custom List"
      };
      list = new ShoppingList({
        familyId: family._id,
        name: listNamesMap[listType] || "Shopping List",
        type: listType,
        status: "active"
      });
      await list.save();
    }

    const items = await Item.find({ familyId: family._id, listId: list._id }).populate("categoryId");
    return res.json({ items, listId: list._id });
  } catch (error) {
    next(error);
  }
});

// POST /api/items - Add item to list
router.post("/", async (req, res, next) => {
  try {
    const { familyCode, listId, listType, categoryId, subcategory, name, quantity, unit, notes, forceAdd, estimatedCost, audioNote } = req.body;

    if (!familyCode || !categoryId || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    let list = null;

    // Prefer listId (most accurate — avoids wrong custom list collisions)
    if (listId) {
      list = await ShoppingList.findOne({ _id: listId, familyId: family._id });
    }

    // Fallback: find by type if listId not provided
    if (!list && listType) {
      list = await ShoppingList.findOne({ familyId: family._id, type: listType, status: "active" });
    }

    // Auto-create if still not found
    if (!list) {
      list = new ShoppingList({
        familyId: family._id,
        name: (listType || "custom") + " List",
        type: listType || "custom",
        status: "active"
      });
      await list.save();
    }

    // Check for duplicates
    if (!forceAdd) {
      const normalizedName = name.toLowerCase().trim();
      const existingItem = await Item.findOne({
        familyId: family._id,
        listId: list._id,
        name: { $regex: new RegExp(`^${normalizedName}$`, "i") }
      });

      if (existingItem) {
        return res.status(200).json({
          conflict: true,
          message: `${name} already exists.`,
          existingItem: {
            _id: existingItem._id,
            name: existingItem.name,
            quantity: existingItem.quantity,
            unit: existingItem.unit
          }
        });
      }
    }

    const newItem = new Item({
      familyId: family._id,
      listId: list._id,
      categoryId,
      subcategory: subcategory || "",
      name: name.trim(),
      quantity: quantity || 1,
      unit: unit || "piece",
      notes: notes || "",
      isPurchased: false,
      estimatedCost: estimatedCost || 0,
      audioNote: audioNote || ""
    });

    await newItem.save();
    return res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    next(error);
  }
});

// PUT /api/items/:id or PUT /api/items (with itemId in body)
router.put("/:id?", async (req, res, next) => {
  try {
    const itemId = req.params.id || req.body.itemId;
    const { familyCode, quantity, unit, notes, isPurchased, isFavorite, categoryId, subcategory, estimatedCost, audioNote } = req.body;

    if (!itemId || !familyCode) {
      return res.status(400).json({ error: "Item ID and family code are required" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    const item = await Item.findOne({ _id: itemId, familyId: family._id });
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    if (quantity !== undefined) item.quantity = quantity;
    if (unit !== undefined) item.unit = unit;
    if (notes !== undefined) item.notes = notes;
    if (isPurchased !== undefined) item.isPurchased = isPurchased;
    if (isFavorite !== undefined) item.isFavorite = isFavorite;
    if (categoryId !== undefined) item.categoryId = categoryId;
    if (subcategory !== undefined) item.subcategory = subcategory;
    if (estimatedCost !== undefined) item.estimatedCost = estimatedCost;
    if (audioNote !== undefined) item.audioNote = audioNote;

    await item.save();
    return res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/items/:id or DELETE /api/items (with itemId in body)
router.delete("/:id?", async (req, res, next) => {
  try {
    const itemId = req.params.id || req.body.itemId;
    const { familyCode } = req.body.familyCode ? req.body : req.query; // Check body or query

    if (!itemId || !familyCode) {
      return res.status(400).json({ error: "Item ID and family code are required" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    const result = await Item.deleteOne({ _id: itemId, familyId: family._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    return res.json({ success: true, deleted: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

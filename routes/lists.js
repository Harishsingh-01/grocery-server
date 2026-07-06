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

// GET /api/lists/templates - Get all templates
router.get("/templates", async (req, res, next) => {
  try {
    const { familyCode } = req.query;
    if (!familyCode || familyCode.length !== 6) {
      return res.status(400).json({ error: "Invalid family code" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    const templates = await ShoppingList.find({
      familyId: family._id,
      type: "template"
    });

    return res.json({ templates });
  } catch (error) {
    next(error);
  }
});

// POST /api/lists/template - Save current list as template
router.post("/template", async (req, res, next) => {
  try {
    const { familyCode, sourceListId, templateName } = req.body;
    if (!familyCode || !sourceListId || !templateName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    const sourceList = await ShoppingList.findOne({ _id: sourceListId, familyId: family._id });
    if (!sourceList) {
      return res.status(404).json({ error: "Source list not found" });
    }

    const newTemplate = new ShoppingList({
      familyId: family._id,
      name: templateName.trim(),
      type: "template",
      status: "active",
      isCompleted: false
    });
    await newTemplate.save();

    const sourceItems = await Item.find({ listId: sourceListId, familyId: family._id }).lean();
    const copiedItems = sourceItems.map((item) => ({
      familyId: family._id,
      listId: newTemplate._id,
      categoryId: item.categoryId,
      subcategory: item.subcategory,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes || "",
      isPurchased: false,
      isFavorite: item.isFavorite || false,
      estimatedCost: item.estimatedCost || 0
    }));

    if (copiedItems.length > 0) {
      await Item.insertMany(copiedItems);
    }

    return res.status(201).json({ success: true, template: newTemplate });
  } catch (error) {
    next(error);
  }
});

// POST /api/lists/apply-template - Apply template to active list
router.post("/apply-template", async (req, res, next) => {
  try {
    const { familyCode, templateId, targetListId } = req.body;
    if (!familyCode || !templateId || !targetListId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    const templateItems = await Item.find({ listId: templateId, familyId: family._id }).lean();
    if (templateItems.length === 0) {
      return res.status(400).json({ error: "Template is empty" });
    }

    const newItems = templateItems.map((item) => ({
      familyId: family._id,
      listId: targetListId,
      categoryId: item.categoryId,
      subcategory: item.subcategory,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      notes: item.notes || "",
      isPurchased: false,
      isFavorite: item.isFavorite || false,
      estimatedCost: item.estimatedCost || 0
    }));

    await Item.insertMany(newItems);
    return res.json({ success: true, count: newItems.length });
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

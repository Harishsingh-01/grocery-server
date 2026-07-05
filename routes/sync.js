const express = require("express");
const router = express.Router();
const Family = require("../models/Family");
const ShoppingList = require("../models/ShoppingList");
const Item = require("../models/Item");
const Category = require("../models/Category");
const Favorite = require("../models/Favorite");

// POST /api/sync
router.post("/", async (req, res, next) => {
  try {
    const { familyCode, operations } = req.body;

    if (!familyCode || !Array.isArray(operations)) {
      return res.status(400).json({ error: "Missing family code or operations" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    // Process each operation sequentially
    for (const op of operations) {
      const { action, store, recordId, data } = op;

      if (store === "items") {
        if (action === "create" && data) {
          const existing = await Item.findById(recordId);
          if (!existing) {
            const newItem = new Item({
              _id: recordId,
              familyId: family._id,
              listId: data.listId,
              categoryId: data.categoryId?._id || data.categoryId,
              subcategory: data.subcategory || "",
              name: data.name,
              quantity: data.quantity,
              unit: data.unit,
              notes: data.notes || "",
              isPurchased: data.isPurchased || false,
              isFavorite: data.isFavorite || false
            });
            await newItem.save();
          }
        } else if (action === "update" && data) {
          const fieldsToUpdate = { ...data };
          if (fieldsToUpdate.categoryId?._id) {
            fieldsToUpdate.categoryId = fieldsToUpdate.categoryId._id;
          }
          await Item.findByIdAndUpdate(recordId, fieldsToUpdate);
        } else if (action === "delete") {
          await Item.findByIdAndDelete(recordId);
        }
      }

      else if (store === "lists") {
        if (action === "create" && data) {
          const existing = await ShoppingList.findById(recordId);
          if (!existing) {
            const newList = new ShoppingList({
              _id: recordId,
              familyId: family._id,
              name: data.name,
              type: data.type,
              status: data.status || "active",
              isCompleted: data.isCompleted || false,
              completedAt: data.completedAt
            });
            await newList.save();
          }
        } else if (action === "update" && data) {
          await ShoppingList.findByIdAndUpdate(recordId, data);
        } else if (action === "delete") {
          await Item.deleteMany({ listId: recordId });
          await ShoppingList.findByIdAndDelete(recordId);
        }
      }

      else if (store === "categories") {
        if (action === "create" && data) {
          const existing = await Category.findById(recordId);
          if (!existing) {
            const newCat = new Category({
              _id: recordId,
              familyId: family._id,
              name: data.name,
              icon: data.icon,
              color: data.color,
              subcategories: data.subcategories || []
            });
            await newCat.save();
          }
        } else if (action === "update" && data) {
          await Category.findByIdAndUpdate(recordId, data);
        } else if (action === "delete") {
          await Category.findByIdAndDelete(recordId);
        }
      }

      else if (store === "favorites") {
        if (action === "create" && data) {
          const existing = await Favorite.findById(recordId);
          if (!existing) {
            const newFav = new Favorite({
              _id: recordId,
              familyId: family._id,
              name: data.name,
              categoryId: data.categoryId?._id || data.categoryId
            });
            await newFav.save();
          }
        } else if (action === "update" && data) {
          await Favorite.findByIdAndUpdate(recordId, data);
        } else if (action === "delete") {
          await Favorite.findByIdAndDelete(recordId);
        }
      }
    }

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

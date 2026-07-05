const express = require("express");
const router = express.Router();
const Family = require("../models/Family");
const Category = require("../models/Category");
const { defaultCategories } = require("../lib/defaultData");

// GET /api/categories?familyCode=...
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

    let categories = await Category.find({ familyId: family._id });

    // Seed defaults if empty
    if (categories.length === 0) {
      const seeded = defaultCategories.map((cat) => ({
        familyId: family._id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        subcategories: cat.subcategories
      }));
      categories = await Category.insertMany(seeded);
    }

    return res.json({ categories });
  } catch (error) {
    next(error);
  }
});

// POST /api/categories - Add custom category or subcategory
router.post("/", async (req, res, next) => {
  try {
    const { familyCode, name, isSubcategory, parentCategoryId, icon, color } = req.body;

    if (!familyCode || familyCode.length !== 6 || !name) {
      return res.status(400).json({ error: "Invalid parameters" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    if (isSubcategory) {
      if (!parentCategoryId) {
        return res.status(400).json({ error: "Parent category ID is required for subcategories" });
      }

      const parentCategory = await Category.findOne({ _id: parentCategoryId, familyId: family._id });
      if (!parentCategory) {
        return res.status(404).json({ error: "Parent category not found" });
      }

      if (parentCategory.subcategories.includes(name)) {
        return res.status(400).json({ error: "Subcategory already exists" });
      }

      parentCategory.subcategories.push(name);
      await parentCategory.save();

      return res.json({ success: true, category: parentCategory });
    } else {
      const existing = await Category.findOne({ name, familyId: family._id });
      if (existing) {
        return res.status(400).json({ error: "Category already exists" });
      }

      const newCategory = new Category({
        familyId: family._id,
        name,
        icon: icon || "ShoppingBag",
        color: color || "bg-primary-light text-primary",
        subcategories: []
      });

      await newCategory.save();
      return res.status(201).json({ success: true, category: newCategory });
    }
  } catch (error) {
    next(error);
  }
});

// PUT /api/categories - Rename category or subcategory
router.put("/", async (req, res, next) => {
  try {
    const { familyCode, categoryId, isSubcategory, newName, oldSubcategoryName } = req.body;

    if (!familyCode || !categoryId || !newName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    const targetCategory = await Category.findOne({ _id: categoryId, familyId: family._id });
    if (!targetCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (isSubcategory) {
      if (!oldSubcategoryName) {
        return res.status(400).json({ error: "Old subcategory name is required to rename" });
      }

      const index = targetCategory.subcategories.indexOf(oldSubcategoryName);
      if (index === -1) {
        return res.status(404).json({ error: "Subcategory not found" });
      }

      targetCategory.subcategories[index] = newName;
      targetCategory.markModified("subcategories");
      await targetCategory.save();

      return res.json({ success: true, category: targetCategory });
    } else {
      targetCategory.name = newName;
      await targetCategory.save();
      return res.json({ success: true, category: targetCategory });
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/categories - Delete category or subcategory
router.delete("/", async (req, res, next) => {
  try {
    const { familyCode, categoryId, isSubcategory, subcategoryName } = req.body;

    if (!familyCode || !categoryId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    const targetCategory = await Category.findOne({ _id: categoryId, familyId: family._id });
    if (!targetCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (isSubcategory) {
      if (!subcategoryName) {
        return res.status(400).json({ error: "Subcategory name is required for deletion" });
      }

      targetCategory.subcategories = targetCategory.subcategories.filter((sub) => sub !== subcategoryName);
      targetCategory.markModified("subcategories");
      await targetCategory.save();

      return res.json({ success: true, category: targetCategory });
    } else {
      await Category.deleteOne({ _id: categoryId, familyId: family._id });
      return res.json({ success: true, deleted: true });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;

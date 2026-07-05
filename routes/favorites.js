const express = require("express");
const router = express.Router();
const Family = require("../models/Family");
const Favorite = require("../models/Favorite");

// GET /api/favorites?familyCode=...
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

    const favorites = await Favorite.find({ familyId: family._id }).populate("categoryId");
    return res.json({ favorites });
  } catch (error) {
    next(error);
  }
});

// POST /api/favorites - Toggle favorite item name inside a category
router.post("/", async (req, res, next) => {
  try {
    const { familyCode, name, categoryId } = req.body;

    if (!familyCode || !name || !categoryId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const family = await Family.findOne({ code: familyCode.toUpperCase() });
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    const normalizedName = name.trim();

    // Check if it already exists
    const existing = await Favorite.findOne({
      familyId: family._id,
      name: { $regex: new RegExp(`^${normalizedName.toLowerCase()}$`, "i") }
    });

    if (existing) {
      // Toggle off: Delete it
      await Favorite.deleteOne({ _id: existing._id });
      return res.json({ success: true, isFavorite: false });
    } else {
      // Toggle on: Create new favorite
      const newFav = new Favorite({
        familyId: family._id,
        name: normalizedName,
        categoryId
      });
      await newFav.save();
      return res.status(201).json({ success: true, isFavorite: true, favorite: newFav });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;

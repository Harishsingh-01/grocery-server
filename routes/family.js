const express = require("express");
const router = express.Router();
const Family = require("../models/Family");

// Helper to generate a random 6-character code
function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// POST /api/family/create - Creates a new family code
router.post("/create", async (req, res, next) => {
  try {
    let code = "";
    let isUnique = false;
    let retries = 0;

    // Retry loop to guarantee uniqueness
    while (!isUnique && retries < 10) {
      code = generateCode();
      const existing = await Family.findOne({ code });
      if (!existing) {
        isUnique = true;
      }
      retries++;
    }

    if (!isUnique) {
      return res.status(500).json({ error: "Could not generate a unique code. Please try again." });
    }

    const newFamily = new Family({
      code,
      name: "My Family"
    });

    await newFamily.save();
    return res.status(201).json({ code: newFamily.code });
  } catch (error) {
    next(error);
  }
});

// POST /api/family/join - Verifies if family code exists
router.post("/join", async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code || typeof code !== "string" || code.trim().length !== 6) {
      return res.status(400).json({ error: "Valid 6-character code is required" });
    }

    const formattedCode = code.toUpperCase().trim();
    const family = await Family.findOne({ code: formattedCode });

    if (!family) {
      return res.status(404).json({ error: "Family not found. Check the code and try again." });
    }

    return res.json({ 
      success: true, 
      code: family.code,
      name: family.name 
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

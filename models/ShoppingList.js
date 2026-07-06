const mongoose = require("mongoose");

const ShoppingListSchema = new mongoose.Schema(
  {
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["today", "weekly", "monthly", "custom", "template"], 
      default: "custom" 
    },
    status: { 
      type: String, 
      enum: ["active", "archived", "completed"], 
      default: "active" 
    },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.models.ShoppingList || mongoose.model("ShoppingList", ShoppingListSchema);

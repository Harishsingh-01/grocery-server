const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    listId: { type: mongoose.Schema.Types.ObjectId, ref: "ShoppingList", required: true, index: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    subcategory: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1 },
    unit: { type: String, default: "piece" },
    notes: { type: String, default: "" },
    isPurchased: { type: Boolean, default: false },
    isFavorite: { type: Boolean, default: false },
    addedBy: { type: String, default: "" },
    estimatedCost: { type: Number, default: 0 },
    audioNote: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Item || mongoose.model("Item", ItemSchema);

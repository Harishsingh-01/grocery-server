const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema(
  {
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    listId: { type: mongoose.Schema.Types.ObjectId, ref: "ShoppingList", index: true },
    completedAt: { type: Date, default: Date.now },
    itemsCount: { type: Number, default: 0 },
    summary: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.models.History || mongoose.model("History", HistorySchema);

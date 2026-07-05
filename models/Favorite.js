const mongoose = require("mongoose");

const FavoriteSchema = new mongoose.Schema(
  {
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: "Family", required: true, index: true },
    name: { type: String, required: true, trim: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Favorite || mongoose.model("Favorite", FavoriteSchema);

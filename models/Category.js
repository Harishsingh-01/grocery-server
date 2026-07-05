const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    familyId: { type: mongoose.Schema.Types.ObjectId, ref: "Family", index: true },
    name: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, default: "bg-primary-light text-primary" },
    subcategories: { type: [String], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Category || mongoose.model("Category", CategorySchema);

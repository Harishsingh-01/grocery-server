const mongoose = require("mongoose");

const FamilySchema = new mongoose.Schema(
  {
    code: { 
      type: String, 
      required: true, 
      unique: true, 
      uppercase: true, 
      trim: true, 
      index: true,
      minlength: 6,
      maxlength: 6
    },
    name: { type: String, default: "My Family" }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Family || mongoose.model("Family", FamilySchema);

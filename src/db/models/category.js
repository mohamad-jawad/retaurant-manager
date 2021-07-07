const mongoose = require("mongoose");

const categorySchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    section: { type: Number, trim: true },
    image: Buffer,
  },
  {
    timestamps: true,
  }
);

categorySchema.virtual("items", {
  ref: "Item",
  localField: "_id",
  foreignField: "category",
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;

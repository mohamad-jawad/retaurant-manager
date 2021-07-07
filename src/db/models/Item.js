const mongoose = require("mongoose");

const itemSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    price: { type: String, required: true, trim: true },
    stock: Number,
    image: Buffer,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Category",
    },
  },
  {
    timestamps: true,
  }
);
itemSchema.index({ name: "text" });

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;

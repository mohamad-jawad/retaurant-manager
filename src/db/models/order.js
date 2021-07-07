const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "pending",
        "canceled",
        "ongoing",
        "finished",
        "rejected",
        "accepted",
      ],
      default: "pending",
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Address",
    },
    order_date: Date,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Branch",
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Item",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

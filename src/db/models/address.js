const mongoose = require("mongoose");

const addressSchema = mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    completeAddress: {
      type: String,
      required: true,
      trim: true,
    },
    coodiantes: {
      latitude: Number,
      longitude: Number,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;

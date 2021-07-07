const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const crypto = require("crypto");

const schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  token: String,
  expires: Date,
  created: { type: Date, default: Date.now },
  createdByIp: String,
  revoked: Date,
  revokedByIp: String,
  replacedByToken: String,
});

schema.virtual("isExpired").get(function () {
  return Date.now() >= this.expires;
});

schema.virtual("isActive").get(function () {
  return !this.revoked && !this.isExpired;
});

schema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
    delete ret.id;
    delete ret.user;
  },
});

schema.statics.generateRefreshToken = function (user, ipAddress) {
  // create a refresh token that expires in 7 days
  try {
    const refreshToken = new RefreshToken({
      user: user._id,
      token: randomTokenString(),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdByIp: ipAddress,
    });
    return refreshToken;
  } catch (e) {
    console.error(e.stack);
    console.log("error: " + e);
  }
};

schema.statics.refreshToken = async function (token) {
  try {
    const refreshToken = await RefreshToken.findOne({ token }).populate("user");
    if (!refreshToken || !refreshToken.isActive) throw "Invalid token";

    const { user } = refreshToken;
    const authToken = user.generateAuthToken();

    return {
      user,
      authToken,
    };
  } catch (e) {
    console.error(e);
    throw "Invalid token";
  }
};

function randomTokenString() {
  return crypto.randomBytes(40).toString("hex");
}

const RefreshToken = mongoose.model("RefreshToken", schema);

module.exports = RefreshToken;

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

module.exports = {
  User: require("./models/user"),
  RefreshToken: require("./models/refresh-token"),
  Category: require("./models/category"),
  Item: require("./models/Item"),
  Branch: require("./models/branch"),
  Address: require("./models/address"),
  Order: require("./models/order"),
  isValidId,
};

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

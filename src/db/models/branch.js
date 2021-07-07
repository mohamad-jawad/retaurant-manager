const mongoose = require("mongoose");

const branchSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone_number: Number,
    coodiantes: {
      latitude: Number,
      longitude: Number,
    },
  },
  {
    timestamps: true,
  }
);

//find closest branch
branchSchema.statics.findNearestBranch = async (lat1, long1) => {
  const branches = await Branch.find();

  if (!branches) {
    throw new Error("No branches");
  }
  const distances = branches.map((branch) => {
    const lat2 = branch.coodiantes.latitude;
    const long2 = branch.coodiantes.longitude;
    return {
      distance: calcCrow(lat1, long1, lat2, long2),
      branch: branch,
    };
  });
  distances.sort((a, b) =>
    a.distance > b.distance ? 1 : b.distance > a.distance ? -1 : 0
  );
  return distances[0];
};

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
  return (Value * Math.PI) / 180;
}

const Branch = mongoose.model("Branch", branchSchema);

module.exports = Branch;

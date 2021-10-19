// import module
const mongoose = require("mongoose");

// import DB
const config = require("../config/database");

// create schema
var Schema = mongoose.Schema;

// Define property for Schema
const PropertySchema = mongoose.Schema({
  fields: {
    name: { type: String, default: "" },
    apartmentName: { type: String, default: "" },
    type: { type: String, default: "" },
    price: { type: Number, default: "" },
    size: { type: Number, default: "" },
    capacity: { type: Number, default: "" },
    pets: { type: Boolean, default: false },
    breakfast: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    description: { type: String, default: "" },
    extras: [{ type: String, default: "" }],
    images: [
      {
        name: { type: String, default: "" },
      },
    ],
  },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const Property = (module.exports = mongoose.model("Property", PropertySchema));

// Find Property By Property ID
module.exports.getPropertyById = function (id, callback) {
  Property.findById(id, callback);
};

// Update Property By Property ID
module.exports.saveModProperty = function (id, property, callback) {
  var query = { _id: id };
  Property.findOneAndUpdate(query, property, callback);
};

// Find Property By User ID
module.exports.findUserProperties = function (id, callback) {
  Property.find({ user: id }).populate().exec(callback);
};

// Find All Properties By Query
module.exports.findAllProperties = function (query, callback) {
  if (query.name != undefined)
    query.name = { $regex: query.name, $options: "i" };
  Property.find(query).populate().exec(callback);
};

// Add Property
module.exports.addProperties = function (property, callback) {
  property.save(callback);
};

const express = require("express");
const router = express.Router();

const passport = require("passport");

const Property = require("../models/property");

router.get("/all", (req, res, next) => {
  Property.findAllProperties(req.query, (err, prop) => {
    if (err) return res.status(500).send("Server error!");
    return res.status(200).json({ obj: prop });
  });
});

module.exports = router;

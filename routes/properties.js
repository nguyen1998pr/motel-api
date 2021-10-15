const express = require("express");
const router = express.Router();

const passport = require("passport");

const Property = require("../models/property");

const multer = require("multer");

const cloudinary = require("../config/cloudinary");

router.get("/all", (req, res, next) => {
  Property.findAllProperties(req.query, (err, prop) => {
    if (err) return res.status(500).send("Server error!");
    return res.status(200).json({ obj: prop });
  });
});

var upload = multer({ storage: storage });

router.post(
  "/add",
  upload.array("photo", 100),
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    let itsMe = JSON.parse(req.body.thisProp);

    let prop = new Property(itsMe);

    prop.user = req.user._id;

    req.files.map((item, index) => {
      prop.images.push({
        fields: {
          file: {
            url: item.filename,
          },
        },
      });
      cloudinary.v2.uploader.upload("./uploads/properties/" + item.filename, {
        use_filename: true,
        unique_filename: false,
      });
    });

    Property.addProperty(prop, (err) => {
      if (err) return res.status(500).send("Server Error!");
      return res.status(201).send("Apartment Saved!");
    });
  }
);

module.exports = router;

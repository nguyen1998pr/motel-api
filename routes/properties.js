const express = require("express");
const router = express.Router();

const passport = require("passport");

const User = require("../models/user");
const Property = require("../models/property");

const multer = require("multer");
const crypto = require("crypto");

const cloudinary = require("../config/cloudinary");
const { session } = require("passport");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/properties");
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      let ext = file.originalname.split(".").pop();
      cb(null, raw.toString("hex") + Date.now() + "." + ext);
    });
  },
});

router.get(
  "/edit/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    Property.getPropertyById(req.params.id.toString(), (err, prop) => {
      if (err) return res.status(500).send("Server Error!");
      if (!prop) return res.status(422).send("Apartment Not Found!");
      if (prop.user.toString() != req.user._id.toString())
        return res.status(403).send("You Don't Own The Apartment");
      else return res.status(200).json({ prop: prop });
    });
  }
);

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
      prop.fields.images?.push({ name: item.filename });
      cloudinary.v2.uploader.upload("./uploads/properties/" + item.filename, {
        use_filename: true,
        unique_filename: false,
      });
    });

    Property.addProperties(prop, (err) => {
      if (err) return res.status(500).send(/*"Server Error!"*/ err);
      return res.status(201).send("Apartment Saved!");
    });
  }
);

module.exports = router;

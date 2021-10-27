const express = require("express");
const router = express.Router();

const passport = require("passport");

const User = require("../models/user");
const Property = require("../models/property");

const multer = require("multer");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const cloudinary = require("../config/cloudinary");

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

var upload = multer({ storage: storage });

router.get("/view/:id", (req, res, next) => {
  Property.getPropertyById(req.params.id.toString(), (err, prop) => {
    if (err) return res.status(500).send(err);
    if (!prop) return res.status(422).send("Property Not Found!");
    User.getUserById(prop.user, (err, user) => {
      if (err) return res.status(500).send(err);
      if (user) return res.status(200).json({ user: user, prop: prop });
      else return res.status(422).send("Owner Not Found");
    });
  });
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

router.patch(
  "/edit/:id",
  upload.array("photo", 20),
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    Property.getPropertyById(req.params.id.toString(), async (err, prop) => {
      if (err) return res.status(500).send(/*"Server Error!"*/ err);
      else if (!prop) return res.status(422).send("Property Not Found");
      else {
        if (prop.user.toString() != req.user._id.toString())
          return res.status(403).send("You don't own the property");
        else {
          let itsMe = JSON.parse(req.body.thisProp);

          await Promise.all(
            prop.fields.images.map((item) => {
              deleteFile(item.name);
            })
          );

          await Promise.all(
            req.files.map((item, index) => {
              itsMe.fields.images?.push({ name: item.filename });
              cloudinary.uploader.upload(
                "./uploads/properties/" + item.filename,
                {
                  use_filename: true,
                  unique_filename: false,
                }
              );
            })
          );

          Property.saveModProperty(req.params.id.toString(), itsMe, (err) => {
            if (err) return res.status(500).send(err);
            else return res.status(200).send(itsMe);
          });
        }
      }
    });
  }
);

router.patch(
  "/edit/:id/panorama",
  upload.array("photo", 20),
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    Property.getPropertyById(req.params.id.toString(), async (err, prop) => {
      if (err) return res.status(500).send(/*"Server Error!"*/ err);
      else if (!prop) return res.status(422).send("Property Not Found");
      else {
        if (prop.user.toString() != req.user._id.toString())
          return res.status(403).send("You don't own the property");
        else {
          let itsMe = JSON.parse(req.body.thisProp);

          if (req.files.length) {
            prop.fields.panoImages?.length &&
              (await Promise.all(
                prop.fields.panoImages?.map((item) => {
                  deleteFile(item.name);
                })
              ));

            await Promise.all(
              req.files.map((item, index) => {
                itsMe.fields.panoImages?.push({ name: item.filename });
                cloudinary.uploader.upload(
                  "./uploads/properties/" + item.filename,
                  {
                    use_filename: true,
                    unique_filename: false,
                  }
                );
              })
            );
          }

          Property.saveModProperty(req.params.id.toString(), itsMe, (err) => {
            if (err) return res.status(500).send(/*"Server Error!"*/ err);
            else return res.status(200).send("Apartment Saved!");
          });
        }
      }
    });
  }
);

router.get("/all", (req, res, next) => {
  Property.findAllProperties(req.query, (err, prop) => {
    if (err) return res.status(500).send("Server error!");
    return res.status(200).json({ obj: prop });
  });
});

router.post(
  "/add",
  upload.array("photo", 20),
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    let itsMe = JSON.parse(req.body.thisProp);

    let prop = new Property(itsMe);

    prop.user = req.user._id;

    const multiplePhotoPromise = req.files.map((item) => {
      prop.fields.images?.push({ name: item.filename });
      cloudinary.uploader.upload(
        `./uploads/properties/${item.filename}`,
        {
          use_filename: true,
          unique_filename: false,
        }
        // function (error, result) {
        //   console.log(result, error);
        // }
      );
    });

    await Promise.all(multiplePhotoPromise);

    Property.addProperties(prop, (err) => {
      if (err) return res.status(500).send(/*"Server Error!"*/ err);
      return res.status(201).send("Apartment Saved!");
    });
  }
);

deleteFile = (image) => {
  if (fs.existsSync(path.join(__dirname, "../uploads/properties/", image))) {
    fs.unlink("./uploads/properties/" + image, (err) => {
      if (err) throw err;
    });
  }
};

module.exports = router;

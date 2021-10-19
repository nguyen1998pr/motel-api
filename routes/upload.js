const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
let http = require("http");

const cloudinary = require("../config/cloudinary");

router.get("/properties/:image", (req, res) => {
  if (req.params.image == "no")
    res
      .status(200)
      .sendFile(
        path.resolve(
          path.resolve(path.join(__dirname, "../uploads/property.png"))
        )
      );
  else if (
    fs.existsSync(
      path.join(__dirname, "../uploads/properties/", req.params.image)
    )
  ) {
    res
      .status(200)
      .sendFile(
        path.resolve(
          path.join(__dirname, "../uploads/properties", req.params.image)
        )
      );
  } else {
    let url = goForBackup(
      path.join(__dirname, "../uploads/properties"),
      req.params.image
    );
    if (url != null) return res.redirect(url);
    else
      return res
        .status(200)
        .sendFile(
          path.resolve(
            path.resolve(path.join(__dirname, "../uploads/property.png"))
          )
        );
  }
});

goForBackup = function (location, name) {
  let re = /<img[^>]+src="?([^"\s]+)"?[^>]*\/>/g;
  let results = re.exec(cloudinary.image(name));
  let img = results[1];
  let url = img.replace(/['\s]+|['\s]+/g, "").toString();
  let file = fs.createWriteStream(location + name);
  http.get(url, function (response) {
    if (response.statusCode == 200) response.pipe(file);
    else url = null;
  });
  return url;
};

module.exports = router;

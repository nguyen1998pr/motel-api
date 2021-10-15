const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: "viettel-solutions",
  api_key: "339611251275451",
  api_secret: "LVnUjsr53Pg7DnGco6hYQvEhifc",
});

module.exports = cloudinary;

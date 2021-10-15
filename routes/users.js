// Import Express
const express = require("express");
const router = express.Router();

// Import Credentials Processor
const jwt = require("jsonwebtoken");
const config = require("../config/database");
const passport = require("passport");

// Import Model
const User = require("../models/user");

const fs = require("fs");
const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

router.post("/register", (req, res, next) => {
  // Get data from client
  let newUser = new User(req.body);

  // Check conditon and Add User
  User.addUser(newUser, (err) => {
    if (err) {
      if (err.name === "MongoError" && err.code === 11000)
        return res.status(409).send("User already exist!");
      else return res.status(500).send(err);
    }
    return res.status(201).send("User Created!");
  });
});

router.post("/login", (req, res, next) => {
  // Get data from client
  const email = req.body.email;
  const password = req.body.password;

  // Find User
  User.getUserByUserEmail(email, (err, user) => {
    if (err) return res.status(500).send("Server Error!");
    if (!user) return res.status(422).send("User not found!");
    if (user.banned === true)
      return res.status(400).send("You have been banned!");
    // If User Exist
    User.comparePassword(password, user.password, (err, isMatch) => {
      // Catch External Error
      if (err) return res.status(500).send("Server Error!");
      // Compare and return Token
      if (isMatch) {
        const token = jwt.sign({ data: user }, config.secret, {
          expiresIn: 604800,
        });
        return res.status(200).json({
          token: "Bearer " + token,
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.userName,
            email: user.email,
          },
        });
      } else return res.status(401).send("Wrong Password!");
    });
  });
});

router.get(
  "/settings",
  passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
    user = req.user;
    return res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        admin: user.admin,
      },
    });
  }
);

module.exports = router;

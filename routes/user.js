const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const checkAuth = require("../middleware/check-auth");

router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({ message: "E-mail exists in database" });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              password: hash,
              email: req.body.email,
              phone: req.body.phone,
            });
            user
              .save()
              .then((result) => {
                console.log(result);
                res.status(201).json({ message: "User created successfully" });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({ error: err });
              });
          }
        });
      }
    });
});

router.post("/login", (req, res, next) => {
  const cookie = req.headers.cookie.split("session_id=Bearer%20")[1];
  const decoded = jwt.verify(cookie, process.env.JWT_KEY);
  User.findOne({ email: req.body.email || decoded.email })
    .exec()
    .then((results) => {
      if (results.length < 1) {
        return res.status(401).json({ message: "Authorization failed" });
      }
      bcrypt.compare(req.body.password, results.password, (err, response) => {
        if (err) {
          return res.status(401).json({ message: "Authorization failed" });
        }
        if (response) {
          const token = jwt.sign(
            {
              email: results.email,
              userId: results._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "2h",
            }
          );
          res.cookie("session_id", "Bearer " + token, {
            expiresIn: new Date() + 3600000 * 24 * 7,
            httpOnly: true,
          });
          return res.status(200).json({
            message: "Authrization successful",
            token: token,
          });
        }
        res.status(401).json({ message: "Authorization failed" });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: "Authorization failed" });
    });
});

router.get("/logout", checkAuth, (req, res, next) => {
  if (req.headers.cookie) {
    res
      .status(200)
      .clearCookie("session_id")
      .json({ message: "Logout successfully" });
  } else {
    res.status(403).json({ message: "Unauthorized" });
  }
});

module.exports = router;

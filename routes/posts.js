const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = require("../models/post");
const checkAuth = require("../middleware/check-auth");
const jwt = require("jsonwebtoken");

router.get("/", (req, res, next) => {
  Post.find()
    .then((results) => {
      const response = {
        count: results.length,
        posts: results.map((result) => {
          return {
            price: result.price,
            title: result.title,
            description: result.description,
            _id: result._id,
            request: {
              type: "GET",
              url: "http://localhost:8080/posts/" + result._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

router.post("/", checkAuth, (req, res, next) => {
  const post = new Post({
    _id: new mongoose.Types.ObjectId(),
    price: req.body.price,
    title: req.body.title,
    description: req.body.description,
    user: req.userData.userId,
  });
  post
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Created a new post",
        createdPost: {
          price: result.price,
          title: result.title,
          description: result.description,
          _id: result._id,
          userId: result.user,
          request: {
            type: "GET",
            url: "http://localhost:8080/posts/" + result._id,
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.get("/:postId", (req, res, next) => {
  const id = req.params.postId;
  Post.findById(id)
    .populate("user", "email phone")
    .select("price title _id description")
    .exec()
    .then((post) => {
      console.log(post);
      if (post) {
        res.status(200).json(post);
      } else {
        res.status(404).json({ message: "No post found with the ID given" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.patch("/:postId", checkAuth, (req, res, next) => {
  const id = req.params.postId;
  Post.updateOne(
    { _id: id },
    {
      $set: {
        price: req.body.newPrice,
        title: req.body.newTitle,
        description: req.body.newDescription,
      },
    }
  )
    .then((result) => {
      res
        .status(200)
        .json({ result, message: "Updated the post successfully" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.delete("/:postId", checkAuth, (req, res, next) => {
  const id = req.params.postId;
  Post.deleteOne({ _id: id })
    .then((result) => {
      res.status(200).json({
        result,
        message: "Post deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;

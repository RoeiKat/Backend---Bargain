const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const cors = require('./middleware/cors');


mongoose.connect(
  `mongodb+srv://adminroei:${process.env.MONGO_ATLAS_PASS}@cluster0.2eibg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors);

const postsRoutes = require("./routes/posts");
const userRoutes = require("./routes/user");

app.use("/posts", postsRoutes);
app.use("/user", userRoutes);

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

app.listen(8080, () => {
  console.log("Bargin API is up and running on localhost 8080");
});

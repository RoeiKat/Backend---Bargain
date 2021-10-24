const mongoose = require("mongoose");
const User = require("./user");

const postSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  price: { type: Number, required: true },
  title: { type: String, required: true },
  description: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Post", postSchema);

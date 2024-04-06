const mongoose = require("mongoose");

// schema structure
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required!"],
    trim: true,
    unique: true,
  },
  firstname: {
    type: String,
    trim: true,
    required: [true, "Firstname is required!"],
  },
  lastname: {
    type: String,
    trim: true,
    required: [true, "Lastname is required!"],
  },
  password: {
    type: String,
    trim: true,
    required: [true, "Password is required!"],
  },
});

// here model takes 2 parameters one is model name in db and 2nd schema for it
const User = mongoose.model("User", userSchema);

module.exports = User;

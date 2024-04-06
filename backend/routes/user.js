const express = require("express");
const status = require("statuses");
const router = express.Router();
const zod = require("zod");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { authMiddleware } = require("../middleware/auth");
const { Account } = require("../models/accountModel");

// zod validation schema
const userSchemaCheck = zod.object({
  username: zod.string().email(),
  firstname: zod.string(),
  lastname: zod.string(),
  password: zod.string(),
});

const userSchemaCheckSign = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

const updateBody = zod.object({
  password: zod.string().optional(),
  firstname: zod.string().optional(),
  lastname: zod.string().optional(),
});

router.post("/signup", async (req, res) => {
  const body = req.body;
  // we checking here the zod validation for that parsing body
  const { success } = userSchemaCheck.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "Incorrect Inputs!",
    });
  }

  const existingUser = await User.findOne({
    username: body.username,
  });

  console.log(existingUser);

  if (existingUser) {
    return res.status(411).json({
      message: "User is already exist!",
    });
  }

  const hashedPassword = await bcrypt.hash(body.password, 10);

  // Create a new user with hashed password
  const user = await User.create({
    username: body.username,
    firstname: body.firstname,
    lastname: body.lastname,
    password: hashedPassword, // Store the hashed password
  });
  const userId = user._id;
  await Account.create({
    userId,
    balance: 1 + Math.random() * 10000,
  });

  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  res.json({
    message: "User created succesfully!",
    token: token,
  });
});

router.post("/signin", async (req, res) => {
  const input = req.body;

  const { success } = userSchemaCheckSign.safeParse(input);
  if (!success) {
    return res.json("Invalid Username or Password!");
  }

  const user = await User.findOne({
    username: input.username,
  });

  if (!user) {
    return res.status(405).json("User does not exist!");
  }
  const userPass = user.password;
  const enteredPass = input.password;

  const check = await bcrypt.compare(enteredPass, userPass);
  if (!check) {
    return res.status(403).json("Incorrect Password!");
  }
  // generating token
  if (user) {
    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET
    );

    res.json({
      token: token,
    });
    return;
  }

  res.status(200).json({
    message: "User login Succesfully!",
    token,
  });
});

router.put("/update", authMiddleware, async (req, res) => {
  const body = req.body;
  const { success } = updateBody.safeParse(body);
  if (!success) {
    return res.status(411).json("Invalid Input!");
  }

  await User.updateOne(req.body, {
    id: req.userId,
  });
  return res.status(200).json({
    message: "Updated Succesfully",
  });
});

router.get("/bulk", authMiddleware, async (req, res) => {
  const filterTerm = req.query.filter || " ";
  const users = await User.find({
    $or: [
      { firstname: { $regex: filterTerm } },
      {
        lastname: {
          // case insensitive regular expression
          $regex: filterTerm,
        },
      },
    ],
  });

  console.log(users);
  return res.json({
    user: users.map((user) => ({
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      _id: user._id,
    })),
  });
});

module.exports = router;

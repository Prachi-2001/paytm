const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { Account } = require("../models/accountModel");
const { mongoose } = require("mongoose");
const { message } = require("statuses");
const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
  const account = await Account.findOne({
    userId: req.userId,
  });
  res.json({
    balance: account.balance,
  });
});

router.post("/transfer", authMiddleware, async (req, res) => {
  const session = await await mongoose.startSession();
  await session.startTransaction();
  try {
    const { amount, to } = req.body;
    const account = await Account.findOne({
      userId: req.userId,
    });
    if (!account || account.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    const toAccount = await Account.findOne({
      userId: to,
    });

    if (!toAccount) {
      await session.abortTransaction();
      return res.status(400).json({
        message: "Invalid account",
      });
    }

    await Account.updateOne(
      { userId: req.userId },
      { $inc: { balance: -amount } }
    ).session(session);
    await Account.updateOne(
      { userId: to },
      { $inc: { balance: amount } }
    ).session(session);

    await session.commitTransaction();
    res.status(200).json({
      message: "Money Transfer Succesfully!",
    });
  } catch (error) {
    await session.abortTransaction();
  }
});

module.exports = router;

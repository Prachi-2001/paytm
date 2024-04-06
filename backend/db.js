const mongoose = require("mongoose");
const app = require("./index");
const dotenv = require("dotenv");
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log(`mongodb connected succesfully at ${process.env.MONGO_URI}`);
  app.listen(process.env.PORT, () => {
    console.log(`server succesfully connected to ${process.env.PORT}`);
  });
});

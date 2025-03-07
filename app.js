const express = require("express");
const Sequelize = require("./util/database");
const cors = require("cors");
const bodyParse = require("body-parser");

const userRoute = require("./routes/userRoute");
const userModel = require("./models/userModel");

const app = express();

app.use(cors());
app.use(bodyParse.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRoute);

require("dotenv").config();

Sequelize.sync()
  .then((result) => {
    app.listen(process.env.PORT);
    console.log("Server is On");
  })
  .catch((err) => {
    console.log(err);
  });

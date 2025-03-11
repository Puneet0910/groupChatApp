const express = require("express");
const Sequelize = require("./util/database");
const cors = require("cors");
const bodyParse = require("body-parser");

const userRoute = require("./routes/userRoute");
const msgRoute = require('./routes/messageRoute');

const userModel = require("./models/userModel");
const msgModel = require("./models/msgModel");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(bodyParse.json());
app.use(express.urlencoded({ extended: true }));

app.use("/user", userRoute);
app.use('/msg', msgRoute)


require("dotenv").config();

userModel.hasMany(msgModel);
msgModel.belongsTo(userModel);

Sequelize.sync()
  .then((result) => {
    app.listen(process.env.PORT);
    console.log("Server is On");
  })
  .catch((err) => {
    console.log(err);
  });

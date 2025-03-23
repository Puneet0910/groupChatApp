const express = require("express");
const Sequelize = require("./util/database");
const cors = require("cors");
const bodyParse = require("body-parser");

const userRoute = require("./routes/userRoute");
const msgRoute = require('./routes/messageRoute');
const groupRoute = require('./routes/groupRoute');

const userModel = require("./models/userModel");
const msgModel = require("./models/msgModel");
const Group = require('./models/group');
const groupMember = require('./models/groupMember');

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
app.use('/groups',groupRoute);

require("dotenv").config();

userModel.hasMany(msgModel);
msgModel.belongsTo(userModel);

Group.hasMany(msgModel);
msgModel.belongsTo(Group);

Group.belongsTo(userModel, { as: "creator", foreignKey: "createdBy" });
groupMember.belongsTo(userModel);
groupMember.belongsTo(Group);
Group.hasMany(groupMember);

Sequelize.sync()
  .then((result) => {
    app.listen(process.env.PORT);
    console.log("Server is On");
  })
  .catch((err) => {
    console.log(err);
  });
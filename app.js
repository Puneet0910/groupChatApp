const express = require("express");
const Sequelize = require("./util/database");
const cors = require("cors");
const bodyParse = require("body-parser");

const userRoute = require("./routes/userRoute");
const msgRoute = require("./routes/msgRoute");
const groupRoutes = require('./routes/groupRoutes');

const userModel = require('./models/user');
const msgModel = require('./models/messages');
const Group = require("./models/group");
const GroupMember = require("./models/groupMember");

const app = express();

app.use(
  cors({
    origin: "*",
    // methods: ['GET', 'POST']
  })
);
app.use(bodyParse.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRoute);
app.use("/msg", msgRoute);
app.use('/groups', groupRoutes);
require("dotenv").config();

userModel.hasMany(msgModel);
msgModel.belongsTo(userModel);

Group.hasMany(msgModel);
msgModel.belongsTo(Group);

Group.belongsTo(userModel, { as: "creator", foreignKey: "createdBy" });
GroupMember.belongsTo(userModel);
GroupMember.belongsTo(Group);
Group.hasMany(GroupMember);

Sequelize.sync()
  .then((result) => {
    app.listen(process.env.PORT);
    console.log("Server is On");
  })
  .catch((err) => {
    console.log(err);
  });

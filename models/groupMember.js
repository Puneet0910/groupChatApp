const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const GroupMember = sequelize.define("groupMember", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  groupId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    allowNull: true,
    defaultValue:false,
  },
});

module.exports = GroupMember;

const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const Message = sequelize.define("message", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "user", // Name of the users table
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  },
  groupId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: "groups", // Name of the groups table
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  },
  message: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  timestamp: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
});

module.exports = Message;

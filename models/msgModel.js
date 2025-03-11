const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const Message = sequelize.define("msgModel", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  content: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  groupId: {
    type: Sequelize.INTEGER,
    allowNull: true,
  },
  userName: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});
module.exports = Message;
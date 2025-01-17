const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Message = sequelize.define('message',{
  id:{
    type:Sequelize.INTEGER,
    autoIncrement:true,
    primaryKey:true,
    allowNull:false,
  },
  message:{
    type:Sequelize.STRING,
    allowNull:false,
  },
  userName:{
    type:Sequelize.STRING,
    allowNull:false,
  },
});

module.exports = Message;
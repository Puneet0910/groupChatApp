const userModel = require("../models/userModel");

const bcrypt = require("bcrypt");

exports.signup = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // check if user already exists
    const isExistingUser = await userModel.findOne({ where: { email } });
    if (isExistingUser) {
      return res.status(409).json({ message: "User Already Exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });
    return res.status(201).json({ message: "Signup Successfull" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const jwt = require("jsonwebtoken");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Password" });
    }
    const token = jwt.sign(
      { userId: user.id, userName: user.name },
      process.env.JWT_SECRET
    );
    return res.status(200).json({ message: "Login Successfull", user, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};
exports.getUsers = async (req, res, next) => {
  const { Op } = require("sequelize");
  try {
    const loggedInUserName = req.user?.userName; // Assuming req.user contains the logged-in user's info

    const users = await userModel.findAll({
      attributes: ["name"],
      where: {
        name: { [Op.ne]: loggedInUserName }, // Exclude logged-in user
      },
    });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



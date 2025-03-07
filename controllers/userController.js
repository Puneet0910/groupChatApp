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

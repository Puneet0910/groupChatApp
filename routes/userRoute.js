const express = require("express");
const auth = require('../middleware/auth')
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.get("/getUsers",auth,userController.getUsers);
module.exports = router;

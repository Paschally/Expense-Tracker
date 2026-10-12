const express = require("express");
const {registerUser, loginUser} = require('../controllers/userController');

const router = express.Router();

router.post("/register", registerUser);                 // Register a new user
router.post("/login", loginUser);                       // Log in an existing user

module.exports = router;

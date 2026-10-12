/*
This controller handles registration and login. 
It also generates a JWT token that the client can use when accessing protected endpoints.
*/

const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Register a new user
const registerUser = async(req, res)=>{
  try{
    // get user info from request body
    const { username, email, password, isActive, role} = req.body;

    // check if user already exists with name and email
    const checkExistingUser = await User.findOne({$or: [{username, email}]})
    if(checkExistingUser){
      res.status(500).json({
        success: false,
        message: "User already exists, try with different username and email...."
      })
    }

    // hash password
    const salt = await bcrypt.genSalt(9);
    const hashedPassword = await bcrypt.hash(password, salt);

    //create new user
    const newUser = new User({
      username, email,
      password: hashedPassword,
      isActive,
      role: role || 'user'
    })
    await newUser.save();
    if(newUser){
      res.status(201).json({
        success: true,
        message: "User registered successfully"
      })
    } else{
      res.status(201).json({
        success: false,
        message: "Unable to register user"
      })
    }
  }catch(error){
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Some error error occurred, try again..'
    })
  }
}

// Login a new user
const loginUser = async(req, res)=>{
  try{
    const {username, password} = req.body;

    // check if curren user already exists
    const user = await User.findOne({username});

    if(!user){
      return res.status(400).status({
        success: false,
        message: 'User does not exist'
      })
    }
    // check if password matches
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if(!isPasswordMatch){
      return res.status(400).status({
        success: false,
        message: 'Invalid credentials'
      })
    }
    // create user token
    const bearerToken = jwt.sign({
      userId : user._id,
      username : user.username,
      isActive : user.isActive,
      role : user.role
    }, process.env.JWT_SECRET_KEY, {
      expiresIn : '40m'
    })

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      bearerToken
    })
  }catch(error){
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Some error error occurred, try again..'
    })
  }
}

module.exports = {registerUser, loginUser};
/*
This controller handles:
1. User registration
2. User login and JWT generation
3. Getting all users (admin only)
4. Deleting all users (admin only)
*/

import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Register a new user
export const registerUser = async(req, res)=>{
  try{
    // get user info from request body
    const { username, email, password, isActive, role} = req.body;

    // check if user already exists with name and email
    const checkExistingUser = await User.findOne({$or: [{username, email}]})
    if(checkExistingUser){
      return res.status(500).json({
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
      return res.status(201).json({
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
export const loginUser = async(req, res)=>{
  try{
    const {username, password} = req.body;

    // check if curren user already exists
    const user = await User.findOne({username});

    if(!user){
      return res.status(400).json({
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

// Get all users (admin only; enforce this in the routes too)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({
      success: true,
      count: users.length,
      users });
  } catch (error) {
    console.error("Get users error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve users"});
  }
};

 // Delete one user by ID (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent deleting admin accounts through this endpoint
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin accounts cannot be deleted through this endpoint",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete user",
    });
  }
};

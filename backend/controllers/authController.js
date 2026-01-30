//import relelvant libraries
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import Manager from '../models/Manager.js';

//handles new manager creation (signup)
export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    //gets input from manager and checks if the manager with the same email already exists
    const existingManager = await Manager.findOne({ email });
    if (existingManager) {
      return res.status(400).json({ message: 'Manager already exists' });
    }
    // Hash the password using argo2id hash function with parameters recommended by OWASP 2026
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,      
      parallelism: 1
    });
    //create a new manager instance
    const manager = new Manager({
      email,
      password: hashedPassword,
      name
    });
    //save to database
    await manager.save();
    //respond in concsole with success message
    res.status(201).json({ message: 'Manager signuped successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//handles login  and manager authentication

export const login = async (req, res) => {
  try {
    //get user input
    const { email, password } = req.body;
    //find manager by email 
    const manager = await Manager.findOne({ email });
    if (!manager) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    //check if password matches the stored hash
    const isValidPassword = await argon2.verify(manager.password, password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // generate JWT with manager identity
    const token = jwt.sign(
      { id: manager._id, email: manager.email },
      process.env.JWT_SECRET, //secret key from .env
      { expiresIn: process.env.JWT_EXPIRE } // token expiration time
    );
    // store it  in an http only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days exouratuib
    });
    //sen success response without exposing sensitive data
    res.json({
      message: 'Login successful',
      manager: {
        id: manager._id,
        email: manager.email,
        name: manager.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



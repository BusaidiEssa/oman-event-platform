import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import Manager from '../models/Manager.js';

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingManager = await Manager.findOne({ email });
    if (existingManager) {
      return res.status(400).json({ message: 'Manager already exists' });
    }

    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4
    });

    const manager = new Manager({
      email,
      password: hashedPassword,
      name
    });

    await manager.save();

    res.status(201).json({ message: 'Manager registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const manager = await Manager.findOne({ email });
    if (!manager) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await argon2.verify(manager.password, password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: manager._id, email: manager.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

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

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
};

export const getProfile = async (req, res) => {
  try {
    const manager = await Manager.findById(req.managerId).select('-password');
    res.json(manager);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
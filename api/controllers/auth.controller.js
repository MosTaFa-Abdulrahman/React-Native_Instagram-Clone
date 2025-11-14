const prisma = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Helper Method
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashPassword },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        imgUrl: true,
        coverImgUrl: true,
        city: true,
        createdDate: true,
      },
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      error: "Registration failed",
      details: error.message,
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return res.status(400).json({ error: "User not found" });
    }

    const validatePassword = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!validatePassword) {
      return res.status(401).json({ error: "Wrong Password 😥" });
    }

    const token = generateToken(existingUser.id);
    res.json({
      message: "Login successful",
      user: {
        id: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        imgUrl: existingUser.imgUrl,
        coverImgUrl: existingUser.coverImgUrl,
        city: existingUser.city,
        createdDate: existingUser.createdDate,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    res.cookie("token", "", { maxAge: 1 });
    res.status(200).json({ message: "User logged out successfully 😍" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed" });
  }
};

// Get ((Current-Profile))
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        imgUrl: true,
        coverImgUrl: true,
        city: true,
        createdDate: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Error Get Profile !!!" });
  }
};

module.exports = { register, login, logout, getProfile };

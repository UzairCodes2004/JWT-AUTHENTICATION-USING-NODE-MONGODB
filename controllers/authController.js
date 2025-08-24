const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc Register User
// @route POST /api/v1/auth/register
exports.registerUser = async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Username or Email already exists" });
    }

    const user = await User.create({ name, username, email, password });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc Login User
exports.loginUser = async (req, res, next) => {
  try {
    const { identifier, username, email, password } = req.body;

    // pick whichever identifier is provided
    const user = await User.findOne({
      $or: [
        { email: identifier || email },
        { username: identifier || username },
      ],
    });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (error) {
    next(error);
  }
};

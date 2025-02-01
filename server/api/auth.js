const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcrypt");
const JWT = process.env.JWT || "1234";

// Import functions
const { createUser, getUser, getUserId } = require("../db/db");

const setToken = (id) => {
  return jwt.sign({ id }, JWT, { expiresIn: "5h" });
};

// Authorize the Token with Id
const isLoggedIn = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });;
  }
  const token = authHeader.slice(7);
  if (!token) return next();
  try {
    const { id } = jwt.verify(token, JWT);
    const user = await getUserId(id);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Register a New User
router.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const response = await createUser(username, password);
    const token = setToken(response.id);
    res.status(201).json(token);
  } catch (error) {
    next(error);
  }
});

// Login a User
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await getUser(username);
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      const token = setToken(user.id);
      res.status(200).json(token);
    } else {
      res.status(403).json({ message: "Username and Password do not match" });
    }
  } catch (error) {
    next(error);
  }
});

// Get the Logged-in User's Information
router.get("/me", isLoggedIn, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


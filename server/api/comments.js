const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT = process.env.JWT || "1234";
const { prisma } = require("../db/common");
const { getUserId } = require("../db/db");

// Authorize the Token with Id
const isLoggedIn = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  const token = authHeader.slice(7);
  if (!token) return next();
  try {
    const { id } = jwt.verify(token, JWT);
    console.log(id);
    const user = await getUserId(id);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Get Comments Made by a User
router.get("/me", isLoggedIn, async (req, res, next) => {
  try {
    const comments = await prisma.comments.findMany({
      where: {
        userId: parseInt(req.user.id),
        comment: req.body.comment,
      },
    });
    res.send(comments);
  } catch (error) {
    next(error);
  }
});

// Update a User's Comment
router.put("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const comments = await prisma.comments.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        comment: req.body.comment,
      },
    });
    res.send(comments);
  } catch (error) {
    next(error);
  }
});

// Delete a User's Comment
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const comments = await prisma.comments.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    console.log(comments)
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

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

// Get Reviews Made by a User
router.get("/me", isLoggedIn, async (req, res, next) => {
  try {
    const reviews = await prisma.reviews.findMany({
      where: {
        userId: parseInt(req.user.id),
        review: req.body.review,
      },
    });
    res.send(reviews);
  } catch (error) {
    next(error);
  }
});

//Update a Users review
router.put("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const reviews = await prisma.reviews.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: {
        review: req.body.review,
        rating: parseInt(req.body.rating),
      },
    });
    res.send(reviews);
  } catch (error) {
    next(error);
  }
});

//Delete a Users review
router.delete("/:id", isLoggedIn, async (req, res, next) => {
  try {
    const reviews = await prisma.reviews.delete({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.status(204).send(reviews);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
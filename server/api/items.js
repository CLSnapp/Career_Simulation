const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT = process.env.JWT || "1234";
const { prisma } = require("../db/common");
const { getUserId } = require("../db/db");

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

// Get all items
router.get("/", async (req, res, next) => {
  try {
    const items = await prisma.items.findMany();
    res.send(items);
  } catch (error) {
    next(error);
  }
});

// Get individual item
router.get("/:id", async (req, res, next) => {
  try {
    const items = await prisma.items.findFirstOrThrow({
      where: {
        id: parseInt(req.params.id),
      },
    });
    const avgRating = await prisma.reviews.aggregate({
      _avg: {
        rating: true,
      },
    });
    console.log("Avg rating" + avgRating._avg.rating);
    res.send({ items, avgRating });
  } catch (error) {
    next(error);
  }
});

// Get individual item reviews
router.get("/:id/reviews", async (req, res, next) => {
  try {
    const reviews = await prisma.reviews.findMany({
      where: {
        itemId: parseInt(req.params.id),
        review: req.body.review,
      },
    });
    res.send(reviews);
  } catch (error) {
    next(error);
  }
});

// Get individual review
router.get("/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const review = await prisma.reviews.findFirst({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.send(review);
  } catch (error) {
    next(error);
  }
});

// Create a review
router.post("/:id/reviews", isLoggedIn, async (req, res, next) => {
  try {
    const reviews = await prisma.reviews.create({
      data: {
        user: { connect: { id: parseInt(req.user.id) } },
        item: { connect: { id: parseInt(req.params.id) } },
        review: req.body.review,
        rating: parseInt(req.body.rating),
      },
    });

    res.status(201).send(reviews);
  } catch (error) {
    next(error);
  }
});

// Create a comment on review

router.post(
  "/:id/reviews/:reviewId/comments",
  isLoggedIn,
  async (req, res, next) => {
    try {
      const comments = await prisma.comments.create({
        data: {
          user: { connect: { id: parseInt(req.user.id) } },
          review: { connect: { id: parseInt(req.params.id) } },
          comment: req.body.comment,
        },
      });
      res.status(201).send(comments);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

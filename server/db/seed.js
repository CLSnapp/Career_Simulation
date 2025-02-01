const db = require("../db/index");
const { faker } = require("@faker-js/faker");
const { prisma } = require("../db/common");
require("dotenv").config();

async function seed() {
  console.log("Seeding the database.");
  try {
    await db.query("DROP TABLE IF EXISTS users, items, comments, reviews;");

    // Add 10 Users.
    await Promise.all(
      [...Array(10)].map(() =>
        prisma.users.create({
          data: {
            username: faker.internet.username(),
            password: faker.internet.password(),
          },
        })
      )
    );

    // Add 20 items.
    await Promise.all(
      [...Array(20)].map(() =>
        prisma.items.createMany({
          data: {
            name: faker.commerce.product(),
            description: faker.commerce.productDescription(),
          },
        })
      )
    );

    // Add 10 reviews.
    await Promise.all(
      [...Array(10)].map((_, i) =>
        prisma.reviews.createMany({
          data: {
            review: faker.lorem.paragraph(2),
            rating: faker.number.int(5),
            userId: (i % 5) + 1,
            itemId: (i % 5) + 1,
          },
        })
      )
    );

    // Add 10 comments.
    await Promise.all(
      [...Array(10)].map((_, i) =>
        prisma.comments.createMany({
          data: {
            comment: faker.lorem.paragraph(2),
            userId: (i % 5) + 1,
            reviewId: (i % 5) + 1,
          },
        })
      )
    );

    console.log("Database is seeded.");
  } catch (err) {
    console.error(err);
  }
}

// Seed the database if we are running this file directly.
if (require.main === module) {
  seed();
}

module.exports = seed;

const router = require("express").Router();

//Import Backend routes
router.use("/auth", require("./auth"));
router.use("/items", require("./items"));
router.use("/comments", require("./comments"));
router.use("/reviews", require("./reviews"));


module.exports = router;

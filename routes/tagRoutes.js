const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const { getAllTags } = require("../controllers/tagController");

// Protect this route
router.get("/", authenticate, getAllTags); // GET /api/tags

module.exports = router;

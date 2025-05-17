// ✅ Correct: use Express, not 'router'
const express = require("express");
const mediarouter = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const {
  getPresignedUrl,
  confirmUpload,
  fetchMedia,
} = require("../controllers/mediaController");

mediarouter.post("/presigned-url", authenticate, getPresignedUrl);
mediarouter.post("/confirm-upload", authenticate, confirmUpload);
mediarouter.get("/all", authenticate, fetchMedia);

module.exports = mediarouter;

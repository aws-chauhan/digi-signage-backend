const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { register, login, refresh } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/protected", auth, (req, res) => {
  res.json({ message: "Protected route accessed!", userId: req.userId });
});

module.exports = router;

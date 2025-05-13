const jwt = require("jsonwebtoken");

const generateAccessToken = (userPayload) => {
  return jwt.sign(userPayload, process.env.ACCESS_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (userPayload) => {
  return jwt.sign(userPayload, process.env.REFRESH_SECRET, { expiresIn: "7d" });
};

module.exports = { generateAccessToken, generateRefreshToken };

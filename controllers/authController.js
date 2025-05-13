const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokenUtils");

exports.register = async (req, res) => {
  try {
    const { username, password, firstName, lastName, phoneNumber, email } =
      req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      email,
    });

    res.status(201).json({ message: "User created", user: user.username });
  } catch (err) {
    console.error("❌ Error during registration:", err);
    res.status(400).json({ error: `Error while creating user: ${err}` });
  }
};
exports.login = async (req, res) => {
  const { username, password } = req.body;
  console.log(
    `Received request for login ${username} with pasword ${password}`
  );
  const user = await User.findOne({ where: { username } });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  user.refreshToken = refreshToken;
  await user.save();

  res.json({ accessToken, refreshToken });
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (user.refreshToken !== refreshToken) throw new Error();

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

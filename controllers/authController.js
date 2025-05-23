const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Role } = require("../models");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokenUtils");
const isProduction = process.env.NODE_ENV === "production";
const httpOnly = process.env.COOKIE_HTTP_ONLY === "true";

exports.register = async (req, res) => {
  try {
    const {
      username,
      password,
      firstName,
      lastName,
      phoneNumber,
      email,
      role, // expecting 'admin', 'editor', or 'viewer'
    } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role is required." });
    }

    const roleRecord = await Role.findOne({ where: { name: role } });

    if (!roleRecord) {
      return res.status(400).json({ error: `Invalid role: ${role}` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      email,
      roleId: roleRecord.id,
      isActive: true, // ✅ explicitly set isActive
    });

    res.status(201).json({ message: "User created", user: user.username });
  } catch (err) {
    console.error("❌ Error during registration:", err);
    res
      .status(400)
      .json({ error: `Error while creating user: ${err.message}` });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  console.log(`🟡 Login attempt for: ${username}`);

  const user = await User.findOne({
    where: { username },
    include: { model: Role, attributes: ["name"] },
  });

  if (!user) {
    console.log("🔴 User not found");
    return res.status(400).json({ error: "Invalid credentials" });
  }

  if (!user.isActive) {
    console.log("🔒 Inactive user login attempt");
    return res.status(403).json({ error: "User account is inactive" });
  }

  console.log("🟢 User found:", user.username);
  console.log("🔐 Password:", password);
  console.log("🔐 Stored hash:", user.password);

  const valid = await bcrypt.compare(password, user.password);
  console.log("🔍 Password match:", valid);

  if (!valid) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const userPayload = {
    userId: user.id,
    role: user.Role.name,
  };

  const accessToken = generateAccessToken(userPayload);
  const refreshToken = generateRefreshToken(userPayload);

  user.refreshToken = refreshToken;
  await user.save();

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.Role.name,
        isActive: user.isActive, // ✅ Added user status
      },
    });
};

exports.refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(401).json({ error: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user || user.refreshToken !== refreshToken) throw new Error();

    const newPayload = {
      userId: user.id,
      role: "admin", // Or user.role
    };

    const newAccessToken = generateAccessToken(newPayload);
    const newRefreshToken = generateRefreshToken(newPayload);

    user.refreshToken = newRefreshToken;
    await user.save();

    res
      .cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ message: "Tokens refreshed" });
  } catch {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

// controllers/authController.js

exports.logout = async (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out successfully" });
};

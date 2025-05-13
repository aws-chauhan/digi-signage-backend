const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    console.log("❌ No accessToken cookie found");
    return res.status(401).send("Unauthorized");
  }

  try {
    const payload = jwt.verify(token, process.env.ACCESS_SECRET); // should match
    req.userId = payload.userId;
    next();
  } catch (err) {
    console.error("Invalid token:", err.message);
    return res.status(403).send("Forbidden");
  }
};

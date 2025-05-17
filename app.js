require("dotenv").config();
const express = require("express");
const { sequelize } = require("./models");
const authRoutes = require("./routes/authRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const tagRoutes = require("./routes/tagRoutes");

const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(express.json());
// Add this before routes
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api/tags", tagRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api", authRoutes);

sequelize.sync().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
  });
});
// sequelize.sync({ alter: true }).then(() => {
//   app.listen(process.env.PORT, () => {
//     console.log(`🚀 Server running on port ${process.env.PORT}`);
//   });
// });

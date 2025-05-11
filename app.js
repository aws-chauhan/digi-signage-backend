require("dotenv").config();
const express = require("express");
const { sequelize } = require("./models");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());

app.use("/api", authRoutes);

sequelize.sync({ force: true }).then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
  });
});

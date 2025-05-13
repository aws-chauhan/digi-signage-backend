const sequelize = require("../config/db"); // ✅ Fix here

const User = require("./User");
const MediaContent = require("./MediaContent");

// Set up associations
User.hasMany(MediaContent, {
  foreignKey: "uploadedBy",
  onDelete: "CASCADE",
});
MediaContent.belongsTo(User, {
  foreignKey: "uploadedBy",
});

module.exports = {
  sequelize, // ✅ this was missing
  User,
  MediaContent,
};

const sequelize = require("../config/db");

const User = require("./user");
const Role = require("./Role");
const MediaContent = require("./MediaContent");

// User ↔ Role
Role.hasMany(User, { foreignKey: "roleId" });
User.belongsTo(Role, { foreignKey: "roleId" });

// User ↔ MediaContent
User.hasMany(MediaContent, {
  foreignKey: "uploadedBy",
  onDelete: "CASCADE",
});
MediaContent.belongsTo(User, {
  foreignKey: "uploadedBy",
});

module.exports = {
  sequelize,
  User,
  Role,
  MediaContent,
};

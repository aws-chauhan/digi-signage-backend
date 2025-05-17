const sequelize = require("../config/db");

const User = require("./user");
const Role = require("./Role");
const MediaContent = require("./MediaContent");
const Tag = require("./Tag");

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

// ✅ MediaContent ↔ Tag (Many-to-Many via MediaTags)
MediaContent.belongsToMany(Tag, {
  through: "MediaTags",
  foreignKey: "mediaContentId",
});
Tag.belongsToMany(MediaContent, {
  through: "MediaTags",
  foreignKey: "tagId",
});

module.exports = {
  sequelize,
  User,
  Role,
  MediaContent,
  Tag,
};

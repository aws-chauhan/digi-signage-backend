const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Tag = sequelize.define(
  "Tag",
  {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  },
  {
    tableName: "tags",
    timestamps: true,
  }
);

module.exports = Tag;

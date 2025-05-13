const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const MediaContent = sequelize.define(
  "MediaContent",
  {
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "media_contents",
    timestamps: true,
  }
);

module.exports = MediaContent;

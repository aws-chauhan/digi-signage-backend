const { Tag } = require("../models");
const { Op } = require("sequelize");

exports.getAllTags = async (req, res) => {
  try {
    const search = req.query.search;

    const tags = await Tag.findAll({
      where: search
        ? {
            name: {
              [Op.iLike]: `%${search}%`, // Case-insensitive partial match
            },
          }
        : {},
      order: [["name", "ASC"]],
      limit: 10, // for autocomplete, limit the number
    });

    res.json({ tags });
  } catch (err) {
    console.error("❌ Error fetching tags:", err);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
};

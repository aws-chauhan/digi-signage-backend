const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const { MediaContent, Tag } = require("../models");

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// POST /api/media/presigned-url
exports.getPresignedUrl = async (req, res) => {
  console.log("[INFO] Requested presigned URL");

  const { filename, filetype, userId } = req.body;
  console.log("[DEBUG] Request body:", req.body);

  if (!filename || !filetype || !userId) {
    console.warn("[WARN] Missing filename, filetype, or userId");
    return res
      .status(400)
      .json({ error: "Missing filename, filetype, or userId" });
  }

  const key = `userMedia/uploads/${userId}/${uuidv4()}_${filename}`;
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Expires: 60,
    ContentType: filetype,
  };

  try {
    const url = await s3.getSignedUrlPromise("putObject", params);
    console.log("[INFO] Presigned URL generated");
    console.log("[DEBUG] URL:", url);
    console.log("[DEBUG] S3 Key:", key);
    res.json({ url, key });
  } catch (err) {
    console.error("[ERROR] Failed to generate signed URL:", err);
    res.status(500).json({ error: "Presigned URL generation failed" });
  }
};

// POST /api/media/confirm-upload
exports.confirmUpload = async (req, res) => {
  console.log("[INFO] Confirming uploaded media");

  const {
    key,
    userId,
    filename,
    mimeType,
    fileSize,
    description,
    tags = [],
  } = req.body;
  console.log("[DEBUG] Confirm payload:", req.body);

  if (!key || !userId || !filename || !mimeType || !fileSize) {
    console.warn("[WARN] Missing required fields for confirmation");
    return res.status(400).json({ error: "Missing required fields" });
  }

  const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  try {
    const media = await MediaContent.create({
      fileUrl,
      uploadedBy: userId,
      filename,
      mimeType,
      fileSize,
      description: description || null,
    });

    if (tags.length > 0) {
      for (const tagName of tags) {
        const [tag] = await Tag.findOrCreate({ where: { name: tagName } });
        await media.addTag(tag);
      }
    }

    console.log("[INFO] Media content and tags saved to database");
    res.json({ message: "Upload recorded", fileUrl });
  } catch (err) {
    console.error("[ERROR] Failed to save media content to DB:", err);
    res.status(500).json({ error: "DB save failed" });
  }
};

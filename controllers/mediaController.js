const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const { MediaContent } = require("../models");

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// POST /api/media/presigned-url
exports.getPresignedUrl = async (req, res) => {
  console.log(11111111111111, "Getting url");
  const { filename, filetype, userId } = req.body;

  if (!filename || !filetype || !userId) {
    return res
      .status(400)
      .json({ error: "Missing filename, filetype, or userId" });
  }

  const key = `uploads/${userId}/${uuidv4()}_${filename}`;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Expires: 60,
    ContentType: filetype,
    ACL: "public-read",
  };

  try {
    const url = await s3.getSignedUrlPromise("putObject", params);
    res.json({ url, key });
  } catch (err) {
    console.error("❌ Failed to generate signed URL:", err);
    res.status(500).json({ error: "Presigned URL generation failed" });
  }
};

// POST /api/media/confirm-upload
exports.confirmUpload = async (req, res) => {
  const { key, userId } = req.body;

  if (!key || !userId) {
    return res.status(400).json({ error: "Missing key or userId" });
  }

  const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  try {
    await MediaContent.create({
      fileUrl,
      uploadedBy: userId,
    });

    res.json({ message: "Upload recorded", fileUrl });
  } catch (err) {
    console.error("❌ Failed to save media content:", err);
    res.status(500).json({ error: "DB save failed" });
  }
};

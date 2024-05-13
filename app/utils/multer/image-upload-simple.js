const express = require("express");
const path = require("path");
const multer = require("multer");
const app = express();
// const Jimp = require("jimp");
// const fs = require("fs");

const multerMiddleWareStorage = multer.diskStorage({
  destination: (req, res, callBack) => {
    callBack(null, "uploads/");
  },
  filename: (req, file, callBack) => {
    callBack(null, Date.now() + path.extname(file.originalname));
    // callBack(null, Date.now() + ".png");
  },
});
const fileFilter = (req, file, callBack) => {
  const allowedFileTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
  ];
  if (allowedFileTypes.includes(file.mimetype)) {
    callBack(null, true);
  } else {
    callBack(null, false);
  }
};
const upload = multer({
  storage: multerMiddleWareStorage,
  limits: {
    fileSize: 1000000000, // 1000000000 Bytes = 1000 MB
  },
  fileFilter: fileFilter,
});

const UploadImage = app.post("/", upload.single("image"), async (req, res) => {
  try {
    const imageUpload = req.file.path;
    res.json({ path: imageUpload });
  } catch (error) {
    res.send(error);
  }
});
module.exports = UploadImage;

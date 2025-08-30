const multer = require("multer");
const path = require("path");

// กำหนด storage
const storage = multer.memoryStorage(); // ใช้ memoryStorage เพื่อเก็บเป็น buffer

// กำหนดประเภทไฟล์ที่อนุญาต
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PNG and JPEG files are allowed"), false);
  }
};

// สร้าง middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;

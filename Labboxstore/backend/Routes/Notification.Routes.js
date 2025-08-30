const express = require("express");
const router = express.Router();
const NotificationConTroller = require("../Controllers/Notification.Controllers");

// ดึงข้อมูลทั้งหมดจากตาราง notification
router.get("/", NotificationConTroller.GetAllData);

// เพิ่มข้อมูลใหม่เข้าสู่ตาราง notification
router.post("/", NotificationConTroller.InsertData);
router.delete("/", NotificationConTroller.DeleteAll);

module.exports = router;

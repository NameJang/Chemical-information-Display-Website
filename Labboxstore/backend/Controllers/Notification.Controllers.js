const NotificationDB = require("../Models/Notification.Models"); // เปลี่ยน import ให้ตรงกับชื่อ model จริงของคุณ

exports.GetAllData = async (req, res) => {
    try {
        const Notifications = await NotificationDB.GetAllData();
        res.status(200).json(Notifications);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch all data from notification" });
    }
};

exports.InsertData = async (req, res) => {
  try {
    const { name, barcode, expire_date } = req.body;

    if (!name || !barcode || !expire_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // คำนวณจำนวนวันที่เหลือ
    const expire = new Date(expire_date);
    const today = new Date();
    const timeDiff = expire - today;
    const date_remain = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // แปลง millisec → วัน

    const newData = {
      name,
      barcode,
      expire_date,
      date_remain,
    };

    const inserted = await NotificationDB.InsertData(newData);
    res.status(201).json(inserted);
  } catch (error) {
    console.error("Insert error:", error);
    res.status(500).json({ error: "Failed to insert notification" });
  }
};

exports.DeleteAll = async (req, res) => {
    try {
        const result = await NotificationDB.DeleteAll();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to delete all notifications" });
    }
};
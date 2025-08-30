require("dotenv").config(); // โหลด environment variables
const express = require("express");
const cors = require("cors");
const path = require("path");
const { ConnectDB } = require("./Config/db.js");
const cron = require("node-cron");

const StorageRoutes = require("./Routes/Storage.Routes.js");
const BarcodeRoutes = require("./Routes/Barcode.Routes.js");
const LogRoutes = require("./Routes/Log.Routes.js");
const Chemical_ReturnsRoutes = require("./Routes/Chemical_Returns.Routes.js");
const NotificationRoutes = require("./Routes/Notification.Routes.js");
const UserloginRoutes = require("./Routes/Userlogin.Routes.js");
const WebRoutes = require("./Routes/Web.Routes.js");

const BarcodeModels = require("./Models/Barcode.Models.js");
const NotificationModels = require("./Models/Notification.Models.js");

const SendNotification = require("./Utils/SendNotification.js");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors()); // เปิดใช้งาน CORS ถ้าเรียกจาก frontend ต่าง domain
app.use(express.json()); // รองรับ JSON
app.use(express.urlencoded({ extended: true })); // รองรับ x-www-form-urlencoded
ConnectDB(); // เชื่อมต่อฐานข้อมูล

// Serve static files from the 'HTML', 'CSS', and 'JS' directories
app.use("/assets", express.static(path.join(__dirname, "../frontend/assets")));
app.use("/HTML", express.static(path.join(__dirname, "../frontend/HTML")));
app.use("/CSS", express.static(path.join(__dirname, "../frontend/CSS")));
app.use("/JS", express.static(path.join(__dirname, "../frontend/JS")));

// ใช้งาน route ต่าง ๆ
app.use("/Storage", StorageRoutes);
app.use("/Barcode", BarcodeRoutes);
app.use("/Log", LogRoutes);
app.use("/Chemical_Returns", Chemical_ReturnsRoutes);
app.use("/Userlogin", UserloginRoutes);
app.use("/Notifications", NotificationRoutes);
app.use("/Web", WebRoutes);

cron.schedule("0 0 * * *", async () => {
  const RecieveEmail = "wanGod2007@gmail.com";
  try {
    await NotificationModels.DeleteAll();
    const Barcodes = await BarcodeModels.GetAllData();
    const datanow = new Date();

    for (const Barcode of Barcodes) {
      const expiredDate = new Date(Barcode.expireddate);

      const diffInMs = expiredDate - datanow;
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24); // แปลงเป็นวัน

      const RemainWeek = 3;

      if (diffInDays < 7 * RemainWeek) {
        const dataToInsert = {
          name: Barcode.name,
          barcode: Barcode.barcode,
          expire_date: expiredDate,
          date_remain: Math.ceil(diffInDays),
        };

        await NotificationModels.InsertData(dataToInsert); // เรียกใช้ฟังก์ชัน insert
        console.log(
          `บันทึกการแจ้งเตือน: ${Barcode.name} (เหลือ ${Math.ceil(
            diffInDays
          )} วัน)`
        );
      }
    }
    await SendNotification.exportPDF(RecieveEmail);
  } catch (error) {
    console.error(
      "Error checking expiration or inserting notification:",
      error
    );
  }
});

// เริ่มต้น server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

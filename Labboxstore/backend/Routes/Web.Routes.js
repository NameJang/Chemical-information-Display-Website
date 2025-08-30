const express = require("express");
const path = require("path");
const router = express.Router();

// Serve HTML files
const serveHtml = (fileName) => (req, res) => {
  // Update path to the frontend directory (relative to the project root)
  res.sendFile(path.join(__dirname, "../../frontend/HTML", fileName)); // '../' to go up one level from backend to root
};

router.get("/homepage", serveHtml("../HTML/homepage.html"));
router.get("/fetch", serveHtml("../HTML/fetchStorage.html"));
router.get("/send", serveHtml("../HTML/sendStorage.html"));
router.get("/home", serveHtml("../HTML/home.html"));
router.get("/log", serveHtml("../HTML/logdata.html"));
router.get("/sendData", serveHtml("../HTML/sendData.html"));
router.get("/noti", serveHtml("../HTML/notification.html"));
router.get("/create_barcode.html", serveHtml("create_barcode.html"));

module.exports = router;

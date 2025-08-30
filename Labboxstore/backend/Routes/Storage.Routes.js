const express = require("express");
const StorageDBControllers = require("../Controllers/Storage.Controllers");
const router = express.Router();
const upload = require("../Middleware/upload");

router.get("/", StorageDBControllers.GetAllData);
router.post("/", StorageDBControllers.InsertData);
router.put(
  "/Picture/:name",
  upload.single("Picture"),
  StorageDBControllers.PutPicture
);
router.delete("/:name", StorageDBControllers.DeleteByName);
router.put("/Increase/:name", StorageDBControllers.IncreaseAmount);
router.put("/Decrease/:name", StorageDBControllers.DecreaseAmount);
router.put("/:name", StorageDBControllers.EditData);
router.get('/count/zero', StorageDBControllers.CountZeroAmount);
router.get("/no-barcode", StorageDBControllers.GetNoBarcodeChemicals);


module.exports = router;

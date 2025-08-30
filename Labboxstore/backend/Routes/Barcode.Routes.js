const express = require ('express')
const BarcodeConTrollers = require('../Controllers/Barcode.Controllers')
const router = express.Router()
router.get('/',BarcodeConTrollers.GetAllData);
router.post('/',BarcodeConTrollers.InsertData);
router.delete('/:barcode', BarcodeConTrollers.DeleteByBarcode);
router.put('/Unavailable/:barcode', BarcodeConTrollers.UpdateStatusUnavailable);
router.put('/Available/:barcode', BarcodeConTrollers.UpdateStatusAvailable);
router.get('/name/:name', BarcodeConTrollers.GetDataByName);
router.post('/set-current', BarcodeConTrollers.SetCurrentBarcode);
router.get('/current', BarcodeConTrollers.GetCurrentBarcode);
router.get('/count', BarcodeConTrollers.CountAllRows);
router.get('/count/expiring-soon', BarcodeConTrollers.CountExpiringSoon);
router.get('/count/expired', BarcodeConTrollers.CountExpiredBarcodes);
router.get('/count/location/cabinet', BarcodeConTrollers.CountCabinetLocation);
router.get('/count/location/shelf', BarcodeConTrollers.CountShelfLocation);
router.get('/count/location/shelf/:name', BarcodeConTrollers.CountShelfLocationByName);
router.get('/count/location/cabinet/:name', BarcodeConTrollers.CountCabinetLocationByName);
router.get('/latest-import-date', BarcodeConTrollers.GetLatestImportDate);
router.post('/update-null-barcode', BarcodeConTrollers.UpdateNullBarcode);
router.get('/count-by-name-importdate', BarcodeConTrollers.CountByNameImportdate);


module.exports = router;
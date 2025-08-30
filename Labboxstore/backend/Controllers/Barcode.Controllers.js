const BarcodeDB = require('../Models/Barcode.Models')
let CurrentBarcode = ""
const LogDB = require('../Models/Log.Models');
exports.GetAllData = async (req, res) => {
  try {
    const Barcode = await BarcodeDB.GetAllData();
    res.status(200).json(Barcode);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all data from storage' });
  }
};
exports.InsertData = async (req, res) => {
  try {
    const { Name, Barcode, Location, ImportDate, ExpiredDate } = req.body;

    // เดิม: if (!Name || !Barcode || !Location || !ImportDate || !ExpiredDate) {
    // แก้ไข: ไม่เช็ค !Barcode แล้ว
    if (!Name || !Location || !ImportDate || !ExpiredDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newEntry = await BarcodeDB.InsertData({ Name, Barcode, Location, ImportDate, ExpiredDate });
    res.status(201).json({ message: 'Data inserted successfully', data: newEntry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to insert data into storage' });
  }
};
exports.DeleteByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    const deleted = await BarcodeDB.DeleteByBarcode(barcode);

    if (!deleted) {
      return res.status(404).json({ message: 'Barcode not found' });
    }

    res.status(200).json({ message: 'Deleted successfully', data: deleted });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete data' });
  }
};
exports.UpdateStatusUnavailable = async (req, res) => {
  try {
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    const updated = await BarcodeDB.UpdateStatusUnavailable(barcode);

    if (!updated) {
      return res.status(404).json({ message: 'Barcode not found or not updated' });
    }

    res.status(200).json({ message: 'Status updated to Unavailable', data: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};
exports.UpdateStatusAvailable = async (req, res) => {
  try {
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    const updated = await BarcodeDB.UpdateStatusAvailable(barcode);

    if (!updated) {
      return res.status(404).json({ message: 'Barcode not found or not updated' });
    }

    res.status(200).json({ message: 'Status updated to Unavailable', data: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};
exports.GetDataByName = async (req, res) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const data = await BarcodeDB.GetDataByName(name);

    if (data.length === 0) {
      return res.status(404).json({ message: 'No data found for the given name' });
    }

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data by name' });
  }
};
exports.SetCurrentBarcode = async (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    CurrentBarcode = barcode; // บันทึกลงตัวแปร
    res.status(200).json({ message: 'Current barcode set successfully', currentBarcode: CurrentBarcode });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set current barcode' });
  }
};
exports.GetCurrentBarcode = async (req, res) => {
  try {
    res.status(200).json({ currentBarcode: CurrentBarcode });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get current barcode' });
  }
};
exports.CountAllRows = async (req, res) => {
  try {
      const count = await BarcodeDB.CountAllRows();
      res.status(200).json({ totalRows: count });
  } catch (error) {
      res.status(500).json({ error: 'Failed to count rows' });
  }
};
exports.CountExpiringSoon = async (req, res) => {
  try {
      const count = await BarcodeDB.CountExpiringSoon();
      res.status(200).json({ expiringSoon: count });
  } catch (error) {
      res.status(500).json({ error: 'Failed to count expiring barcodes' });
  }
};
exports.CountExpiredBarcodes = async (req, res) => {
  try {
      const count = await BarcodeDB.CountExpiredBarcodes();
      res.status(200).json({ expiredCount: count });
  } catch (error) {
      res.status(500).json({ error: 'Failed to count expired barcodes' });
  }
};
exports.CountCabinetLocation = async (req, res) => {
  try {
      const count = await BarcodeDB.CountCabinetLocation();
      res.status(200).json({ cabinetCount: count });
  } catch (error) {
      res.status(500).json({ error: 'Failed to count barcodes in Cabinet location' });
  }
};
exports.CountShelfLocation = async (req, res) => {
  try {
      const count = await BarcodeDB.CountShelfLocation();
      res.status(200).json({ shelfCount: count });
  } catch (error) {
      res.status(500).json({ error: 'Failed to count barcodes in Shelf location' });
  }
};
exports.CountShelfLocationByName = async (req, res) => {
  try {
      const { name } = req.params;
      console.log('CountShelfLocationByName called with name:', name);
      
      if (!name) {
          return res.status(400).json({ error: 'Name is required' });
      }
      
      const count = await BarcodeDB.CountShelfLocationByName(name);
      console.log('Count result:', count);
      
      res.status(200).json({ shelfCount: count });
  } catch (error) {
      console.error('CountShelfLocationByName error:', error);
      res.status(500).json({ error: 'Failed to count barcodes in Shelf location for specific chemical' });
  }
};
exports.CountCabinetLocationByName = async (req, res) => {
  try {
      const { name } = req.params;
      console.log('CountCabinetLocationByName called with name:', name);
      
      if (!name) {
          return res.status(400).json({ error: 'Name is required' });
      }
      
      const count = await BarcodeDB.CountCabinetLocationByName(name);
      console.log('Count result:', count);
      
      res.status(200).json({ cabinetCount: count });
  } catch (error) {
      console.error('CountCabinetLocationByName error:', error);
      res.status(500).json({ error: 'Failed to count barcodes in Cabinet location for specific chemical' });
  }
};
exports.GetLatestImportDate = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const result = await require('../Models/Barcode.Models').GetLatestImportDate(name);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.status(200).json({ ImportDate: result.importdate });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ImportDate' });
  }
};
exports.UpdateNullBarcode = async (req, res) => {
  try {
    const { name, barcode } = req.body;
    if (!name || !barcode) {
      return res.status(400).json({ error: 'Name and barcode are required' });
    }
    const updated = await require('../Models/Barcode.Models').UpdateNullBarcode(name, barcode);
    if (!updated) {
      return res.status(404).json({ error: 'No row with NULL barcode found for this name' });
    }
    // อัปเดต barcode ใน log table ด้วย (เฉพาะ log ที่ barcode ยังเป็น NULL)
    await LogDB.UpdateNullBarcode(name, barcode);
    res.status(200).json({ message: 'Barcode updated successfully', updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update barcode' });
  }
};
exports.CountByNameImportdate = async (req, res) => {
  const { name, importdate } = req.query;
  if (!name || !importdate) {
    return res.status(400).json({ error: 'name and importdate required' });
  }
  try {
    const count = await BarcodeDB.CountByNameImportdate(name, importdate);
    res.json({ count });
  } catch (err) {
    console.error('CountByNameImportdate error:', err);
    res.status(500).json({ error: 'Database error', detail: err.message });
  }
};
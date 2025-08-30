const LogDB = require('../Models/Log.Models')
exports.GetAllData = async (req, res) => {
  try {
    const Log = await LogDB.GetAllData();
    res.status(200).json(Log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch all data from storage' });
  }
};
exports.InsertData = async (req, res) => {
  try {
    const { name, barcode, action } = req.body;

    // barcode สามารถเป็น null ได้
    if (!name || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await LogDB.InsertData(name, barcode, action);
    res.status(201).json({ message: 'Log inserted successfully' });
  } catch (error) {
    console.error('Insert log error:', error);
    res.status(500).json({ error: 'Failed to insert log' });
  }
};
exports.DeleteByname = async (req, res) => {
  try {
    const { name } = req.params;
    await LogDB.DeleteByname(name);
    res.status(200).json({ message: 'Log deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete log by name' });
  }
};

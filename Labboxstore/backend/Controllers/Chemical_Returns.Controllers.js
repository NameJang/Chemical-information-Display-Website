const Chemical_ReturnsDB = require('../Models/Chemical_Returns.Models')
exports.GetAllData = async (req, res) => {
    try {
        const Chemical_Returns = await Chemical_ReturnsDB.GetAllData();
        res.status(200).json(Chemical_Returns);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch all data from chemical_returns' });
    }
};
exports.Borrow = async (req, res) => {
    try {
        const { Name, Barcode, ClassName, Phonenumber } = req.body;
        const BorrowTime = new Date();
        console.log(BorrowTime);

        // ตรวจสอบข้อมูลเบื้องต้น
        if (!Name || !Barcode) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const insertedData = await Chemical_ReturnsDB.Borrow({
            Name,
            Barcode,
            BorrowTime,
            ClassName,
            Phonenumber
        });

        res.status(201).json(insertedData);
    } catch (error) {
        console.error('Insert borrow data error:', error);
        res.status(500).json({ error: 'Failed to insert data into chemical_returns' });
    }
};

exports.Return = async (req, res) => {
    try {
        const { Name, Barcode, ClassName, Phonenumber } = req.body;
        const ReturnTime = new Date();
        console.log(ReturnTime);

        // ตรวจสอบข้อมูลเบื้องต้น
        if (!Name || !Barcode) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const insertedData = await Chemical_ReturnsDB.Return({
            Name,
            Barcode,
            ReturnTime,
            ClassName,
            Phonenumber
        });

        res.status(201).json(insertedData);
    } catch (error) {
        console.error('Insert return data error:', error);
        res.status(500).json({ error: 'Failed to insert data into chemical_returns' });
    }
};

exports.deleteByname = async (req, res) => {
    try {
        const { name } = req.params;
        const deleted = await Chemical_ReturnsDB.deleteByname(name);
        if (!deleted) {
            return res.status(404).json({ message: 'name not found' });
        }
        res.status(200).json({ message: 'Deleted successfully', deleted });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete by name' });
    }
};


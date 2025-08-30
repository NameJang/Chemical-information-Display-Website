const StorageDB = require("../Models/Storage.Models");
exports.GetAllData = async (req, res) => {
  try {
    const Storage = await StorageDB.GetAllData();
    res.status(200).json(Storage);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch all data from storage" });
  }
};

exports.InsertData = async (req, res) => {
  try {
    const newData = req.body;
    console.log("InsertData received:", newData);
    // ตรวจสอบ required fields
    const requiredFields = [
      "Name",
      "formula",
      "Type",
      "Warning",
      "Elucidation",
      "LocateName",
    ];
    const missingFields = requiredFields.filter((field) => !(field in newData));
    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({ error: `Missing fields: ${missingFields.join(", ")}` });
    }
    const inserted = await StorageDB.InsertData(newData);
    res.status(201).json(inserted);
  } catch (error) {
    console.error("Insert error (InsertData):", error);
    res.status(500).json({ error: error.message || "Failed to insert data" });
  }
};

// ฟังก์ชันสำหรับอัปเดตรูปภาพ โดยรับชื่อและไฟล์จาก multipart/form-data
exports.PutPicture = async (req, res) => {
  try {
    const name = req.params.name;
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }
    const updated = await StorageDB.PutPicture(name, req.file.buffer);
    if (!updated) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json(updated);
  } catch (error) {
    console.error("PutPicture error (PutPicture):", error);
    res.status(500).json({ error: error.message || "Failed to update picture" });
  }
};

exports.DeleteByName = async (req, res) => {
  try {
    const { name } = req.params;
    const deleted = await StorageDB.DeleteByName(name);

    if (!deleted) {
      return res.status(404).json({ error: "Data not found" });
    }

    res.status(200).json({ message: "Deleted successfully", deleted });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete data from storage" });
  }
};
exports.IncreaseAmount = async (req, res) => {
  try {
    const { name } = req.params;
    const updated = await StorageDB.IncreaseAmount(name);

    if (!updated) {
      return res.status(404).json({ error: "Chemical not found" });
    }

    res.status(200).json({ message: "Amount increased", updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to increase amount" });
  }
};
exports.DecreaseAmount = async (req, res) => {
  try {
    const { name } = req.params;
    const updated = await StorageDB.DecreaseAmount(name);

    if (!updated) {
      return res.status(404).json({ error: "Chemical not found" });
    }

    res.status(200).json({ message: "Amount decreased", updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to decrease amount" });
  }
};
exports.EditData = async (req, res) => {
  try {
    const { name } = req.params;
    const updatedData = req.body;

    const updated = await StorageDB.EditData(name, updatedData);

    if (!updated) {
      return res.status(404).json({ error: 'Chemical not found' });
    }

    res.status(200).json({ message: 'Data updated successfully', updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update data in storage' });
  }
};
exports.CountZeroAmount = async (req, res) => {
  try {
    const count = await StorageDB.CountZeroAmount();
    res.status(200).json({ zero_amount_count: count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to count zero-amount entries' });
  }
};

exports.GetNoBarcodeChemicals = async (req, res) => {
  try {
    const chemicals = await StorageDB.GetNoBarcodeChemicals();
    res.status(200).json(chemicals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chemicals without barcode" });
  }
};

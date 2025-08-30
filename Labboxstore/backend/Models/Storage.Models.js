const { pool } = require("../Config/db.js"); // Import the pool from db.js
const StorageDB = {
  GetAllData: async () => {
    try {
      const result = await pool.query("SELECT * FROM storage");
      return result.rows; // PostgreSQL stores data in result.rows
    } catch (error) {
      console.error("Database query error:", error);
      throw error; // Rethrow the error to be handled by the caller
    }
  },
  InsertData: async (data) => {
    const { Name, formula, Type, Warning, Elucidation, LocateName, picture } = data;
    try {
      const result = await pool.query(
        `INSERT INTO storage (name, formula, type, warning, elucidation, locatename, picture, amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 0)
         RETURNING *`,
        [Name, formula, Type, Warning, Elucidation, LocateName, picture || null]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Database insert error:", error);
      throw error;
    }
  },
  EditData: async (originalName, newData) => {
    try {
      // 1. ดึงข้อมูลเดิมจาก DB
      const existing = await pool.query(
        'SELECT * FROM storage WHERE name = $1',
        [originalName]
      );

      if (existing.rows.length === 0) {
        return null; // ไม่พบข้อมูลเดิม
      }

      const current = existing.rows[0];

      // 2. รวมข้อมูลใหม่กับของเดิม
      const updated = {
        name: newData.Name || current.name,
        formula: newData.formula || current.formula,
        type: newData.Type || current.type,
        warning: newData.Warning || current.warning,
        elucidation: newData.Elucidation || current.elucidation,
        locatename: newData.LocateName || current.locatename
      };

      // 3. ทำการอัปเดตข้อมูล
      const result = await pool.query(
        `UPDATE storage
       SET name = $1,
           formula = $2,
           type = $3,
           warning = $4,
           elucidation = $5,
           locatename = $6
       WHERE name = $7
       RETURNING *`,
        [updated.name, updated.formula, updated.type, updated.warning, updated.elucidation, updated.locatename, originalName]
      );

      return result.rows[0];
    } catch (error) {
      console.error("Database partial update error:", error);
      throw error;
    }
  },


  // อัปเดตรูปภาพ โดยใช้ Name เป็นเงื่อนไข
  PutPicture: async (name, pictureBuffer) => {
    try {
      const result = await pool.query(
        `UPDATE storage SET picture = $1 WHERE name = $2 RETURNING *`,
        [pictureBuffer, name]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Database update picture error:", error);
      throw error;
    }
  },
  DeleteByName: async (name) => {
    try {
      const result = await pool.query(
        `DELETE FROM storage WHERE name = $1 RETURNING *`,
        [name]
      );
      return result.rows[0]; // Return deleted row (or undefined if not found)
    } catch (error) {
      console.error("Database delete error:", error);
      throw error;
    }
  },
  IncreaseAmount: async (name) => {
    try {
      const result = await pool.query(
        `UPDATE storage
             SET amount = amount + 1
             WHERE name = $1
             RETURNING *`,
        [name]
      );
      return result.rows[0]; // return updated row
    } catch (error) {
      console.error("Database update (increase amount) error:", error);
      throw error;
    }
  },
  DecreaseAmount: async (name) => {
    try {
      const result = await pool.query(
        `UPDATE storage
             SET amount = amount - 1
             WHERE name = $1
             RETURNING *`,
        [name]
      );
      return result.rows[0]; // return updated row
    } catch (error) {
      console.error("Database update (decrease amount) error:", error);
      throw error;
    }
  },
  CountZeroAmount: async () => {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) AS zero_amount_count FROM storage WHERE amount = 0`
      );
      return parseInt(result.rows[0].zero_amount_count, 10); // แปลงจาก string เป็น int
    } catch (error) {
      console.error("Database count error:", error);
      throw error;
    }
  },
  GetNoBarcodeChemicals: async () => {
    try {
      // LEFT JOIN storage กับ barcode เอาเฉพาะที่ไม่มี barcode
      const result = await pool.query(`
        SELECT s.*
        FROM storage s
        LEFT JOIN barcode b ON s.name = b.name
        WHERE b.barcode IS NULL
      `);
      return result.rows;
    } catch (error) {
      console.error("Database query error (GetNoBarcodeChemicals):", error);
      throw error;
    }
  }
};


module.exports = StorageDB;

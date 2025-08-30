const { pool } = require('../Config/db.js'); // Import the pool from db.js
const LogDB = {
    GetAllData: async () => {
        try {
            const result = await pool.query('SELECT * FROM log');
            return result.rows; // PostgreSQL stores data in result.rows
        } catch (error) {
            console.error('Database query error:', error);
            throw error; // Rethrow the error to be handled by the caller
        }
    },
    InsertData: async (name, barcode, action) => {
        try {
            const time = new Date(); // เวลาปัจจุบัน
            const query = `
                INSERT INTO log (Name, Barcode, Action, Time)
                VALUES ($1, $2, $3, $4)
            `;
            const values = [name, barcode, action, time];
            await pool.query(query, values);
        } catch (error) {
            console.error('Database insert error:', error);
            throw error;
        }
    },
    DeleteByname: async (name) => {
        try {
            const query = `DELETE FROM log WHERE name = $1`;
            const values = [name];
            await pool.query(query, values);
        } catch (error) {
            console.error('Database delete error:', error);
            throw error;
        }
    },
    UpdateNullBarcode: async (name, barcode) => {
        try {
            const result = await pool.query(
                'UPDATE log SET barcode = $1 WHERE name = $2 AND (barcode IS NULL OR barcode = \'\')',
                [barcode, name]
            );
            return result.rowCount;
        } catch (error) {
            console.error('UpdateNullBarcode in log error:', error);
            throw error;
        }
    }
};

module.exports = LogDB
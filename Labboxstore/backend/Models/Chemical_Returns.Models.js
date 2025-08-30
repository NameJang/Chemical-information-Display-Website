const { pool } = require('../Config/db.js'); // Import the pool from db.js
const Chemical_ReturnsDB = {
    GetAllData: async () => {
        try {
            const result = await pool.query('SELECT * FROM chemical_returns');
            return result.rows; // PostgreSQL stores data in result.rows
        } catch (error) {
            console.error('Database query error:', error);
            throw error; // Rethrow the error to be handled by the caller
        }
    },
    Borrow: async ({ Name, Barcode, BorrowTime, ClassName, Phonenumber }) => {
        try {
            const query = `
            INSERT INTO chemical_returns (name, barcode, borrowtime, class, phonenumber)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, barcode, borrowtime, returntime, class, phonenumber;
        `;
            const values = [Name, Barcode, BorrowTime, ClassName, Phonenumber];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Insert borrow data error:', error);
            throw error;
        }
    },

    Return: async ({ Name, Barcode, ReturnTime, ClassName, Phonenumber }) => {
        try {
            const query = `
            INSERT INTO chemical_returns (name, barcode, returntime, class, phonenumber)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, barcode, borrowtime, returntime, class, phonenumber;
        `;
            const values = [Name, Barcode, ReturnTime, ClassName, Phonenumber];
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Insert return data error:', error);
            throw error;
        }
    },
    deleteByname: async (name) => {
        try {
            const query = `DELETE FROM chemical_returns WHERE name = $1 RETURNING *;`;
            const result = await pool.query(query, [name]);
            return result.rows[0]; // คืนแถวที่ถูกลบ หรือ undefined ถ้าไม่เจอ
        } catch (error) {
            console.error('Delete data error:', error);
            throw error;
        }
    }

};
module.exports = Chemical_ReturnsDB
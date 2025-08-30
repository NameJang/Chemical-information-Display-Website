const { pool } = require("../Config/db.js"); // Import the pool from db.js

const NotificationDB = {
    GetAllData: async () => {
        try {
            const result = await pool.query("SELECT * FROM notification");
            return result.rows;
        } catch (error) {
            console.error("Database query error:", error);
            throw error;
        }
    },

    InsertData: async (data) => {
        const { name, barcode, expire_date, date_remain } = data;
        try {
            const result = await pool.query(
                `INSERT INTO notification (name, barcode, expire_date, date_remain)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
                [name, barcode, expire_date, date_remain]
            );
            return result.rows[0];
        } catch (error) {
            console.error("Database insert error:", error);
            throw error;
        }
    },
    DeleteAll: async () => {
        try {
            await pool.query("DELETE FROM notification");
            return { message: "All notifications deleted." };
        } catch (error) {
            console.error("Database delete error:", error);
            throw error;
        }
    }
};

module.exports = NotificationDB;

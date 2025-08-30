const { pool } = require('../Config/db.js'); // Import the pool from db.js
const BarcodeDB = {
    GetAllData: async () => {
        try {
            const result = await pool.query('SELECT * FROM barcode');
            return result.rows; // PostgreSQL stores data in result.rows
        } catch (error) {
            console.error('Database query error:', error);
            throw error; // Rethrow the error to be handled by the caller
        }
    },
    GetDataByName: async (name) => {
        try {
            const result = await pool.query(
                'SELECT * FROM barcode WHERE name = $1',
                [name]
            );
            return result.rows; // ส่งกลับ array ของรายการที่ตรงกับชื่อ
        } catch (error) {
            console.error('GetDataByName query error:', error);
            throw error;
        }
    },
    InsertData: async ({ Name, Barcode, Location, ImportDate, ExpiredDate }) => {
        try {
            const result = await pool.query(
                `INSERT INTO barcode (Name, Barcode, Location, ImportDate, ExpiredDate, Status)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [
                    Name,
                    (Barcode === undefined || Barcode === null || Barcode === '' ? null : Barcode),
                    Location,
                    ImportDate,
                    ExpiredDate,
                    'Available'
                ]
            );
            return result.rows[0]; // Return inserted row
        } catch (error) {
            console.error('Insert query error:', error);
            throw error;
        }
    },
    DeleteByBarcode: async (barcode) => {
        console.log(barcode); // ✅ ตรวจสอบค่า barcode ที่รับเข้ามา

        try {
            const result = await pool.query(
                'DELETE FROM barcode WHERE TRIM(barcode) = $1 RETURNING *;',
                [barcode]
            );
            console.log(result.rows[0]); // ✅ ตรวจสอบผลลัพธ์หลังลบ

            return result.rows[0]; // คืนค่ารายการที่ถูกลบ
        } catch (error) {
            console.error('Delete query error:', error);
            throw error;
        }
    },
    UpdateStatusUnavailable: async (barcode) => {
        try {
            const result = await pool.query(
                `UPDATE barcode 
             SET status = 'Unavailable' 
             WHERE TRIM(barcode) = $1 
             RETURNING *`,
                [barcode]
            );
            return result.rows[0]; // คืนค่ารายการที่ถูกอัปเดต
        } catch (error) {
            console.error('Update status error:', error);
            throw error;
        }
    },
    UpdateStatusAvailable: async (barcode) => {
        try {
            const result = await pool.query(
                `UPDATE barcode 
             SET status = 'Available' 
             WHERE TRIM(barcode) = $1 
             RETURNING *`,
                [barcode]
            );
            return result.rows[0]; // คืนค่ารายการที่ถูกอัปเดต
        } catch (error) {
            console.error('Update status error:', error);
            throw error;
        }
    },
    CountAllRows: async () => {
        try {
            const result = await pool.query('SELECT COUNT(*) FROM barcode');
            return parseInt(result.rows[0].count, 10); // แปลงเป็น integer
        } catch (error) {
            console.error('Count query error:', error);
            throw error;
        }
    },
    CountExpiringSoon: async () => {
        try {
            const result = await pool.query(`
                SELECT COUNT(*) AS expiring_soon_count
                FROM barcode
                WHERE expireddate <= CURRENT_DATE + INTERVAL '21 days'
            `);
            return parseInt(result.rows[0].expiring_soon_count, 10);
        } catch (error) {
            console.error('Expiring soon count error:', error);
            throw error;
        }
    },
    CountExpiredBarcodes: async () => {
        try {
            const result = await pool.query(`
                SELECT COUNT(*) AS expired_count
                FROM barcode
                WHERE expireddate < CURRENT_DATE
            `);
            return parseInt(result.rows[0].expired_count, 10);
        } catch (error) {
            console.error('Expired barcode count error:', error);
            throw error;
        }
    },
    CountCabinetLocation: async () => {
        try {
            const result = await pool.query(`
                SELECT COUNT(*) AS cabinet_count
                FROM barcode
                WHERE location = 'Cabinet'
            `);
            return parseInt(result.rows[0].cabinet_count, 10);
        } catch (error) {
            console.error('Count Cabinet error:', error);
            throw error;
        }
    },
    CountShelfLocation: async () => {
        try {
            const result = await pool.query(`
                SELECT COUNT(*) AS shelf_count
                FROM barcode
                WHERE location = 'Shelf'
            `);
            return parseInt(result.rows[0].shelf_count, 10);
        } catch (error) {
            console.error('Count Shelf error:', error);
            throw error;
        }
    },
    CountShelfLocationByName: async (name) => {
        try {
            console.log('CountShelfLocationByName model called with name:', name);
            const result = await pool.query(`
                SELECT COUNT(*) AS shelf_count
                FROM barcode
                WHERE location = 'Shelf' AND name = $1
            `, [name]);
            console.log('Query result:', result.rows[0]);
            return parseInt(result.rows[0].shelf_count, 10);
        } catch (error) {
            console.error('Count Shelf by name error:', error);
            throw error;
        }
    },
    CountCabinetLocationByName: async (name) => {
        try {
            console.log('CountCabinetLocationByName model called with name:', name);
            const result = await pool.query(`
                SELECT COUNT(*) AS cabinet_count
                FROM barcode
                WHERE location = 'Cabinet' AND name = $1
            `, [name]);
            console.log('Query result:', result.rows[0]);
            return parseInt(result.rows[0].cabinet_count, 10);
        } catch (error) {
            console.error('Count Cabinet by name error:', error);
            throw error;
        }
    },
    GetLatestImportDate: async (name) => {
        try {
            const result = await pool.query(
                'SELECT importdate FROM barcode WHERE name = $1 ORDER BY importdate DESC LIMIT 1',
                [name]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('GetLatestImportDate error:', error);
            throw error;
        }
    },
    UpdateNullBarcode: async (name, barcode) => {
        try {
            const result = await pool.query(
                'UPDATE barcode SET barcode = $1 WHERE name = $2 AND barcode IS NULL RETURNING *',
                [barcode, name]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('UpdateNullBarcode error:', error);
            throw error;
        }
    },
    // นับจำนวนขวดที่ name และ importdate เดียวกัน (barcode ไม่เป็น null)
    CountByNameImportdate: async (name, importdate) => {
        try {
            const result = await pool.query(
                `SELECT COUNT(*) AS count FROM barcode WHERE name = $1 AND importdate = $2 AND barcode IS NOT NULL`,
                [name, importdate]
            );
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error('CountByNameImportdate error:', error);
            throw error;
        }
    }
};

module.exports = BarcodeDB
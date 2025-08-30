const { pool } = require('../Config/db.js'); // ✅ Import แล้วใช้ pool

const UserloginDB = {
    verify: async (Email, Password) => {
        try {
            const result = await pool.query('SELECT password FROM userlogin WHERE "email" = $1', [Email]);
            const rows = result.rows;

            if (rows.length === 0) {
                return { success: false, reason: 'EMAIL_NOT_FOUND' };
            }

            const storedPassword = rows[0].password; // ✅ ต้องใช้ชื่อฟิลด์เล็กตามใน DB
            const isMatch = Password === storedPassword;

            if (!isMatch) {
                return { success: false, reason: 'Password_INCORRECT' };
            }

            return { success: true };
        } catch (error) {
            console.error('Error verifying user by Email:', Email, error);
            throw error;
        }
    },

    updatePassword: async (Email, newPassword) => {
        try {
            const result = await pool.query(
                'UPDATE userlogin SET password = $1 WHERE email = $2',
                [newPassword, Email]
            );

            if (result.rowCount === 0) {
                console.error('No user found with Email:', Email);
                return false;
            }

            console.log(`Password updated for Email: ${Email}`);
            return true;
        } catch (error) {
            console.error('Error updating Password for Email:', Email, error);
            throw error;
        }
    },
};

module.exports = UserloginDB;

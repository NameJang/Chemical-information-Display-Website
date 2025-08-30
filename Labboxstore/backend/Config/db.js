const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // สำหรับ Neon หรือ Vercel ที่ใช้ SSL
    }
});

const handleDbError = (err, res) => {
    console.error('Database error', err.stack);
    res.status(500).send('Database operation failed');
};

const ConnectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL database');
        client.release();
    } catch (err) {
        console.error('Failed to connect to PostgreSQL database', err);
    }
};

module.exports = {
    handleDbError,
    ConnectDB,
    pool, // export pool เพื่อใช้ query จากไฟล์อื่น ๆ
};

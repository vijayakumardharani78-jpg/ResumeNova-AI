const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        rejectUnauthorized: false
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.log("❌ Database connection failed");
        console.log("HOST:", process.env.DB_HOST);
        console.log("PORT:", process.env.DB_PORT);
        console.log("ERROR:", err);
        return;
    }

    console.log("✅ MariaDB Database Connected Successfully");
    connection.release();
});

module.exports = db;

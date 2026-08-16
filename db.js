const mysql = require("mysql2");

const connection = mysql.createPool({
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
    queueLimit: 0
});

connection.getConnection((err, conn) => {
    if (err) {
        console.log("❌ Database connection failed");
        console.log("HOST:", process.env.DB_HOST);
        console.log("PORT:", process.env.DB_PORT);
        console.log("USER:", process.env.DB_USER);
        console.log("DATABASE:", process.env.DB_NAME);
        console.log("ERROR:", err);
        return;
    }

    console.log("✅ MariaDB Database Connected Successfully");
    conn.release();
});

module.exports = connection;
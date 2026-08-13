const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Dharani@143",
    database: "resumenova_ai"
});

connection.connect((err) => {
    if (err) {
        console.log("Database connection failed ❌");
        return;
    }

    console.log("MySQL Database Connected Successfully ✅");
});

module.exports = connection;
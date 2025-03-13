const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'service',
});

(async () => {
    try {
        const connection = await db.getConnection();
        console.log("Database connected successfully!");


        await connection.query(`
          CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    otp VARCHAR(6) DEFAULT NULL,
    otp_expires DATETIME DEFAULT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

      `);
        console.log(" 'users' table is ready!");


        await connection.query(`
          CREATE TABLE IF NOT EXISTS addresses (
              id INT AUTO_INCREMENT PRIMARY KEY,
              user_id INT NOT NULL, 
              address_type ENUM('Home', 'Office', 'Others') NOT NULL,
              house_area VARCHAR(255) NOT NULL,
              landmark VARCHAR(255) NOT NULL,
              person_name VARCHAR(255) NOT NULL,
              longitude DECIMAL(10, 8) NOT NULL,
              latitude DECIMAL(10, 8) NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
      `);
        console.log("'addresses' table is ready!");
        await connection.query(`
        CREATE TABLE IF NOT EXISTS cards (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,  
             card_type ENUM('credit','debit') NOT NULL,
            card_holder_name VARCHAR(255) NOT NULL,

            card_number VARCHAR(16) NOT NULL UNIQUE,
            expiry_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
    console.log("'card' table is ready!");
    await connection.query(`
        CREATE TABLE IF NOT EXISTS profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone INT(20) NOT NULL UNIQUE,
    gender ENUM('male', 'female') NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    dob DATE NOT NULL,
    profile_image VARCHAR(255) DEFAULT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

        
    `);
        connection.release();

    } catch (error) {
        console.error("Database connection failed:", error);
    }
})();

module.exports = db;

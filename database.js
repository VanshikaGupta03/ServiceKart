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
    
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(20) NOT NULL UNIQUE,
    gender ENUM('male', 'female') DEFAULT NULL,  
    dob DATE DEFAULT NULL,
    profile_image VARCHAR(255) DEFAULT NULL,
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
       CREATE TABLE IF NOT EXISTS cart (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                Product_name VARCHAR(255) NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES product(Product_id) ON DELETE CASCADE
            );

    `);
        connection.release();

    } catch (error) {
        console.error("Database connection failed:", error);
    }
})();

module.exports = db;

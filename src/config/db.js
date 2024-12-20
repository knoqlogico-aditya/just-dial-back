import { config } from 'dotenv';
import mysql from 'mysql2/promise';


config();

const db = mysql.createPool({
    host: process.env.DB_HOST ,
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME 
    

});



(async () => {
    try {
        const connection = await db.getConnection();
        console.log('Connected to MySQL database');
        connection.release(); // Release the connection back to the pool
    } catch (err) {
        console.error('Error connecting to MySQL:', err);
    }
})();

export default db;
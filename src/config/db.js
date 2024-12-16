import { config } from 'dotenv';
import mysql from 'mysql2';


config();

const db = mysql.createConnection({
    host: process.env.DB_HOST ,
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME 
    

});

db.connect((err)=>{
    if(err){
        console.error('error connecting to mysql', err);
        return;
    }
    console.log('connected to mysql database');
})
export default db;
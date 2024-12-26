import db from "../config/db.js";

export default class BusinessModel{
    static async getEmail(email){
        const [rows] = await db.execute('SELECT email FROM users WHERE email = ?', [email]);
        return rows.length > 0;
    }
    static async getBusinessOwnerByEmail(email){
        const [rows] = await db.execute('SELECT user_type FROM users WHERE email = ?', [email]);
        return rows.length > 0 ? rows[0] : null;
    }
    // static async addBusinessEmail (email,businessOwner) {
    //     const [result]= await db.execute('INSERT INTO email_table (email, business_owner) values(?,?)',[email, businessOwner])
    //     return result.insertId;
    // }
    static async setOwner(email){
        const [result] = await db.execute('UPDATE users SET user_type = "business_owner" WHERE email = ?',[email]);
        return result;
    }
    static async insertNameDetails(name,email, phone, userType) {
        const [result] = await db.execute('INSERT INTO users (name,email, phone_number, user_type) VALUES (?,?,?,?)', [name, email, phone, userType]);
        return result;
    }
    static async addBusinessDetails(businessName, pincode, city, state, category, phone, latitude, longitude, website) {
        console.log('inside addBusinessDetails');
        const [result] = await db.execute(
            'INSERT INTO business_details (business_name, pincode, city, state, category, phone, latitude, longitude, website) VALUES (?,?,?,?,?,?,?,?,?)',
            [businessName, pincode, city, state, category, phone, latitude, longitude, website|| null]
        );
        return result;
    } 
    static async getAllBusinessDetails(){
        const [rows] = await db.execute('SELECT * FROM business_details');
        return rows;
    }
}
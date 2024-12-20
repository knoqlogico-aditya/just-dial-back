import db from "../config/db.js";

export default class BusinessModel{
    static async getEmail(email){
        const [rows] = await db.execute('SELECT email FROM email_table WHERE email = ?', [email]);
        return rows.length > 0;
    }
    static async getBusinessOwnerByEmail(email){
        const [rows] = await db.execute('SELECT business_owner FROM email_table WHERE email = ?', [email]);
        return rows.length > 0 ? rows[0] : null;
    }
    static async addBusinessEmail (email,businessOwner) {
        const [result]= await db.execute('INSERT INTO email_table (email, business_owner) values(?,?)',[email, businessOwner])
        return result.insertId;
    }
    static async insertNameDetails(name,email, phone, userType) {
        const [result] = await db.execute('INSERT INTO users (name,email, phone, userType) VALUES (?,?,?)', [name, email, phone, userType]);
        return result;
    }
    static async addBusinessDetails(businessName, pincode, city, state, category, phone, latitude, longitude) {
        console.log('inside addBusinessDetails');
        const [result] = await db.execute(
            'INSERT INTO business_details (business_name, pincode, city, state, category, phone, latitude, longitude) VALUES (?,?,?,?,?,?,?,?)',
            [businessName, pincode, city, state, category, phone, latitude, longitude]
        );
        return result;
    }
}
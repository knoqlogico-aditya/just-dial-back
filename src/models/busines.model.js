import db from "../config/db.js";

export default class BusinessModel {
    static async getUserByEmail(email) {
        try {
            // Query the database to get both userId and user_type
            const [rows] = await db.execute('SELECT user_id, user_type FROM users WHERE email = ?', [email]);

            if (rows.length > 0) {
                return rows[0]; // Return the first row which contains id and user_type
            } else {
                return null; // No user found with the given email
            }
        } catch (error) {
            console.error('Error fetching user by email:', error);
            throw error; // Propagate the error
        }
    }
    static async getRegisteredBusiness(userId) {
        try {
            const [rows] = await db.execute('SELECT * FROM business_details WHERE user_id = ?', [userId]);
            return rows;
        }
        catch (error) {
            console.error('Error fetching business by user id:', error);
            throw error;
        }
    }
    static async getEmail(email) {
        const [rows] = await db.execute('SELECT email FROM users WHERE email = ?', [email]);
        return rows.length > 0;
    }
    static async getBusinessOwnerByEmail(email) {
        const rows = await db.execute('SELECT user_type FROM users WHERE email = ?', [email]);
        return rows.length > 0 ? rows[0] : null;
    }
    // static async addBusinessEmail (email,businessOwner) {
    //     const [result]= await db.execute('INSERT INTO email_table (email, business_owner) values(?,?)',[email, businessOwner])
    //     return result.insertId;
    // }
    static async setOwner(email) {
        const [result] = await db.execute('UPDATE users SET user_type = "business_owner" WHERE email = ?', [email]);
        return result;
    }
    static async insertNameDetails(name, email, phone, userType) {
        const [result] = await db.execute('INSERT INTO users (name,email, phone_number, user_type) VALUES (?,?,?,?)', [name, email, phone, userType]);
        return result;
    }
    static async addBusinessDetails(businessName, pincode, city, state, category, phone, latitude, longitude, website) {
        console.log('inside addBusinessDetails');
        const [result] = await db.execute(
            'INSERT INTO business_details (business_name, pincode, city, state, category, phone, latitude, longitude, website) VALUES (?,?,?,?,?,?,?,?,?)',
            [businessName, pincode, city, state, category, phone, latitude, longitude, website || null]
        );
        return result;
    }
    static async getAllBusinessDetails() {
        const [rows] = await db.execute('SELECT * FROM business_details');
        return rows;
    }
    static async getBusinessDetailsById(id) {
        const [rows] = await db.execute('SELECT * FROM business_details WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    }
    static async getBusinessesByCategory(category) {
        try {
            const [rows] = await db.execute('SELECT * FROM business_details WHERE category = ?', [category]);
            return rows;
        } catch (error) {
            console.error('Error fetching businesses by category:', error);
            throw error; // Propagate the error
        }
    }
    static async getSuggestions(query) {
        const sql = `
        SELECT DISTINCT name FROM businesses WHERE name LIKE ?
        UNION
        SELECT DISTINCT category FROM businesses WHERE category LIKE ?
    `;
        const params = [`%${query}%`, `%${query}%`];
        const [results] = await db.query(sql, params);
        return results.map(row => Object.values(row)[0]);

    }
    static async getBusinessDetailsById(businessId) {
        try{
            const [rows] = await db.execute('SELECT * FROM business_details WHERE id = ?', [businessId]);
            return rows.lenght>0 ? rows[0] : null;

            
            
        }
        catch(error){
            console.error('Error fetching business details by id:', error);
            throw error;
        }


        
    }


}

// (async () => {
//     const email = 'jankiv1980@gmail.com';
//     const user = await BusinessModel.getUserByEmail(email);
//     if (user) {
//         console.log(`User ID: ${user.user_id}, User Type: ${user.user_type}`);
//     } else {
//         console.log(`No user found with email: ${email}`);
//     }
// })();
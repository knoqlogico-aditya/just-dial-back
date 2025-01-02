import { verifyToken } from '../utils/jwt.js';
import db from "../config/db.js";

const authMiddleware = async (req, res, next) => {
    const token = req.cookies['token'];
    console.log('we are in authenitcation middleware');
    if (!token) {
        console.log('no token found redirecting to login');
        
        req.user = null;
        return next();
    }

    try {
        const decoded = verifyToken(token);
        if (!decoded) {
            res.clearCookie('token');
            return res.redirect('/business-login');
        }
        
        const email = decoded.email; // Assuming `email` is in the JWT payload
        const [userResult]  =await db.query('SELECT user_id, email FROM users WHERE email = ?', [email]);

        if (!userResult.length) {
            console.log('User not found in the database');
            res.clearCookie('token');
            return res.redirect('/business-login');
        }

        // Attach user information to the request object
        req.user = {
            id: userResult[0].user_id,
            email: userResult[0].email,
        };

        console.log('User authenticated:', req.user);
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/business-login');
    }
};

export default authMiddleware;
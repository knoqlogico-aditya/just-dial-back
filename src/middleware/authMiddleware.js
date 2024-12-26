import { verifyToken } from '../utils/jwt.js';

const authMiddleware = (req, res, next) => {
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
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.redirect('/business-login');
    }
};

export default authMiddleware;
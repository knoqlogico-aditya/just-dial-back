import db from '../config/db.js';
import session from 'express-session';
import nodemailer from 'nodemailer';
import BusinessModel from '../models/busines.model.js';
import { generateToken } from '../utils/jwt.js';
import { error } from 'console';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
export default class BusinessController {
    async showBusinessBasedOnCategory(req, res) {
        const businesses = await BusinessModel.getAllBusinessDetails();
        res.render('list-of-businesses', { detail: businesses, user: req.user });
    }
    async showOwnListedBusinessList(req, res) {
        if (!req.user) {
            return res.status(401).send('Unauthorized');
        }
        const userId = req.user.id;
        try {
            const registeredBusinesses = await BusinessModel.getListedBusinessesByUserId(userId);
            res.render('your-business', { user: req.user, registeredBusiness: registeredBusinesses });
        }
        catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: "Failed to fetch business details" });
        }
    }
    showNamePage(req, res) {
        if (!req.user) {
            return res.status(401).send('Unauthorizd');
        }
        res.render('enter-your-details', { user: req.user });
    }
    showHome(req, res) {
        console.log(`User: ${req.user}`);
        res.render('home', { user: req.user || null, currentRoute: null });
    }
    logout(req, res) {
        res.clearCookie('token');
        res.redirect('/');
    }
    showBusiness(req, res) {
        const { location, business } = req.body;
        console.log(location, business)

        res.render('business', { location, business });


    }
    showBookTaxi(req, res){
        res.render('book-your-taxi', {user:req.uesr || null})
    }
    businessLogin(req, res) {

        // console.log(generateOTP());
        console.log(req.url);
        res.render('business-login', { user: req.user, message: null, currentRoute: req.url });

    }
    async addNameDetails(req, res) {
        const { name, phone, userType } = req.body;
        const email = req.session.email;

        if (!name || !phone || !userType) {
            return res.status(400).send('All fields are required');
        }

        try {
            const result = await BusinessModel.insertNameDetails(name, email, phone, userType);
            console.log(result)


            res.json({ success: true, message: 'name added successfully!', id: result.insertId });
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ success: false, message: 'Failed to add business' });
        }


    }
    async addBusinessDetails(req, res) {
        if (!req.user) {
            return res.status(401).send('Unauthorized2');
        }
        const userId = req.user.id;


        const { businessName, pincode, city, state, category, phone, latitudeInput, longitudeInput, website } = req.body;
        if (!businessName || !pincode || !city || !state || !category || !phone || !latitudeInput || !longitudeInput) {
            return res.status(400).send('All fields are required');
        }
        try {
            const result = await BusinessModel.addBusinessDetails(userId, businessName, pincode, city, state, category, phone, latitudeInput, longitudeInput, website);

            const email = req.session.email;
            await BusinessModel.setOwner(userId);
            const redirectUrl = `/your-businesses`;



            res.json({ redirectUrl, success: true, message: 'Business details added successfully', });
        }
        catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ success: false, message: 'Failed to add business' });
        }


    }
    getVerifyOtpPage(req, res) {

        const email = req.session.email;
        res.render('verify', { email, user: null });
    }
    async showManageBusiness(req, res) {
        if (!req.user) {
            return res.status(401).send('Unauthorized3');
        }
        const business = await BusinessModel.getBusinessDetailsById(req.params.id);
        console.log(business);
        res.render('manage-business', { user: req.user, business: business, email: req.session.email || null });
    }
    showEnterBusinessDetails(req, res) {

        if (!req.user) {
            return res.status(401).send('Unauthorized');
        }
        const userId = req.user.id;
        res.render('enter-business-details', { userId, user: req.user });
    }

    async sendOtp(req, res) {
        const { email } = req.body;
        console.log(email);
        if (!email) {
            return res.status(400).send('email is required')
        }
        const otp = generateOTP();
        req.session.otp = otp;
        req.session.email = email;
        console.log('Email stored in session:', req.session.email);


        // Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}`,
        };
        try {
            await transporter.sendMail(mailOptions);


            const emailIsPresent = await BusinessModel.getEmail(email);
            console.log(`email status in send otp is email is present: ${emailIsPresent}`);
            res.status(200).json({ success: true, message: 'OTP sent successfully', emailIsPresent });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Failed to send email' });
        }

    }
    async sendOtpPopup(req, res) {
        const { email } = req.body;
        console.log(email);
        if (!email) {
            return res.status(400).send('email is required')
        }
        const otp = generateOTP();
        req.session.otp = otp;
        req.session.email = email;
        console.log('Email stored in session:', req.session.email);


        // Configure nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}`,
        };
        try {
            await transporter.sendMail(mailOptions);


            const emailIsPresent = await BusinessModel.getEmail(email);
            console.log(`email status in send otp is email is present: ${emailIsPresent}`);
            res.status(200).json({ success: true, message: 'OTP sent successfully', emailIsPresent });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Failed to send email' });
        }


    }
    async verifyOtpHandler(req, res) {
        const { otp, userName, userPhone } = req.body;

        if (!otp) {
            console.log('OTP is missing');
            return res.status(400).send('OTP is required');
        }

        if (req.session.otp !== otp) {
            console.log('Invalid OTP');
            return res.status(400).send('Invalid OTP. Please try again.');
        }

        console.log('OTP is valid');
        req.session.otp = null; // Clear OTP after verification

        const email = req.session.email;
        console.log(`The email is ${email}`);

        try {
            const emailIsPresent = await BusinessModel.getEmail(email);

            if (emailIsPresent) {
                const { user_type, user_id } = await BusinessModel.getUserByEmail(email);
                console.log(`User type: ${user_type}, User ID: ${user_id}`);

                // Generate JWT token and set cookie
                const token = generateToken({ email, user_id, user_type });
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000, // 24 hours
                });

                // Redirect based on user type
                const redirectUrl = user_type === 'business_owner'
                    ? `/your-businesses`
                    : '/enter-business-details';

                console.log(`Redirecting to ${redirectUrl}`);
                return res.json({ redirectUrl });
            } else {
                // New user registration
                if (!userName || !userPhone) {
                    console.log('Name or phone is missing');
                    return res.status(400).send('Name and phone are required for new users.');
                }

                const user_type = 'customer';
                console.log(`New user details - Email: ${email}, Name: ${userName}, Phone: ${userPhone}`);

                const result = await BusinessModel.insertNameDetails(userName, email, userPhone, user_type);
                const user_id = result.insertId;

                // Generate JWT token and set cookie
                const token = generateToken({ email, user_id, user_type });
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000, // 24 hours
                });

                console.log('New user registered successfully');
                return res.json({
                    redirectUrl: '/enter-business-details',
                    success: true,
                    message: 'User registered successfully!',
                    id: user_id,
                });
            }
        } catch (error) {
            console.error('Database error:', error);
            return res.status(500).send('An error occurred while processing your request.');
        }
    }
    async verifyOtpHandlerPopupPage(req, res) {

        console.log('Request received:', req.body);

        const { otp, userName, userPhone } = req.body;

        if (!otp) {
            console.log('OTP is missing');
            return res.status(400).send('OTP is required');
        }

        if (req.session.otp !== otp) {
            console.log('Invalid OTP');
            return res.status(400).send('Invalid OTP. Please try again.');
        }

        console.log('OTP is valid');
        req.session.otp = null; // Clear OTP after verification

        const email = req.session.email;
        console.log(`The email is ${email}`);
        try {

            const emailIsPresent = await BusinessModel.getEmail(email);
            if (emailIsPresent) {
                const { user_type, user_id } = await BusinessModel.getUserByEmail(email);
                console.log(`User type: ${user_type}, User ID: ${user_id}`);

                // Generate JWT token and set cookie
                const token = generateToken({ email, user_id, user_type });
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000, // 24 hours
                });

                // Redirect based on user type
                const redirectUrl = '/';

                console.log(`Redirecting to ${redirectUrl}`);
                return res.json({ redirectUrl });
            } else {
                if (!userName || !userPhone) {
                    return res.status(400).json({ message: 'User name and phone are required for registration.' });
                }
    
                const user_type = 'customer';
                console.log(`New user details - Email: ${email}, Name: ${userName}, Phone: ${userPhone}`);
    
                const result = await BusinessModel.insertNameDetails(userName, email, userPhone, user_type);
                const user_id = result.insertId;
    
                // Generate JWT token and set cookie
                const token = generateToken({ email, user_id, user_type });
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 24 * 60 * 60 * 1000,
                });
    
                console.log('New user registered successfully');
                return res.json({
                    redirectUrl: '/',
                    success: true,
                    message: 'User registered successfully!',
                    id: user_id,
                });
    
            }



        }
        catch (error) {
            console.error('Error during OTP verification or user handling:', error);
            return res.status(500).send('An internal server error occurred');
        }


    }

    async showBusinessDetails(req, res) {
        const businessId = req.params.id;
        try {
            const business = await BusinessModel.getBusinessDetailsById(businessId);
        }
        catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: "Failed to fetch business details" });
        }
        res.render('business-details', { user: req.user || null });


    }

    async getAllBusinessDetails(req, res) {
        if (!req.user) {
            return res.status(401).send('Unauthorized4');
        }
        try {
            const businessDetails = await BusinessModel.getAllBusinessDetails();
            res.json(businessDetails);
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: "Failed to fetch business details" });
        }
    }
    async searchCategory(req, res) {
        const category = req.query.category;
        if (!category) {
            return res.status(400).send('category parameter is required');
        }
        try {
            const businesses = await BusinessModel.getBusinessesByCategory(category);
            res.render('list-of-businesses', { user: req.user, businesses });
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: "Failed to fetch business details" });
        }
    }
    async showBusinessDetailsById(req, res) {
        const id = req.params.id;
        if (!id) {
            return res.status(400).send('Query parameter is required');
        }
        try {
            const businessDetails = await BusinessModel.getBusinessDetailsById(id);


            res.render('business-details', { user: req.user, businessDetails });
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: "Failed to search business details" });
        }
    }


}
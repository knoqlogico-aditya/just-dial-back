import db from '../config/db.js';
import session from 'express-session';
import nodemailer from 'nodemailer';
import BusinessModel from '../models/busines.model.js';
import { generateToken } from '../utils/jwt.js';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
export default class BusinessController {
    showNamePage(req, res) {
        if(!req.user){
            return res.status(401).send('Unauthorizd');
        }
        res.render('enter-your-details', { user: req.user });
    }
    showHome(req, res) {
        console.log(`User: ${req.user}`);
        res.render('home', { user: req.user || null });




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
    businessLogin(req, res) {
        // console.log(generateOTP());
        res.render('business-login', {user: req.user , message: null })

    }
    async addNameDetails(req, res) {
        const { name, phone, userType  } = req.body;
        const email = req.session.email;

        if(!name || !phone || !userType ){
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
        const { businessName, pincode, city, state, category, phone, latitudeInput, longitudeInput, website } = req.body;
        if (!businessName || !pincode || !city || !state || !category || !phone || !latitudeInput || !longitudeInput) {
            return res.status(400).send('All fields are required');
        }
        try {
            const result = await BusinessModel.addBusinessDetails(businessName, pincode, city, state, category, phone, latitudeInput, longitudeInput, website);
            console.log(result);
            const email = req.session.email;
            await BusinessModel.setOwner(email);


            
            

            res.json({ success: true, message: 'Business details added successfully', id: result.insertId });
        }
        catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ success: false, message: 'Failed to add business' });
        }
       

    }
    getVerifyOtpPage(req, res) {
        
        const email = req.session.email;
        res.render('verify', { email , user: null });
    }
    showManageBusiness(req, res) {
        if (!req.user) {
            return res.status(401).send('Unauthorized3');
        }
        res.render('manage-business', {user: req.user });
    }
    showEnterBusinessDetails(req, res) {

        if (!req.user) {
            return res.status(401).send('Unauthorized');
        }
        res.render('enter-business-details', { user: req.user});
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

            res.status(200).json({ success: true, message: 'OTP sent successfully' });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Failed to send email' });
        }

    }
    async verifyOtpHandler(req, res) {
        const { otp } = req.body;

        if (!otp) {
            console.log('OTP is missing');
            return res.status(400).send('OTP is required');
        }

        if (req.session.otp === otp) {
            console.log('OTP is valid');
            req.session.otp = null;
            const email = req.session.email;
            console.log(`The email is ${email}`);
            try {
                const emailIsPresent = await BusinessModel.getEmail(email);
                console.log(`Email is present: ${emailIsPresent}`);
                if (emailIsPresent) {
                    try {
                        const businessOwner = await BusinessModel.getBusinessOwnerByEmail(email);
                        console.log(`Business owner: ${businessOwner}`);

                        if (businessOwner === 'business_owner') {
                            console.log('User already exists');
                            const token = generateToken({ email: email });
                            res.cookie('token', token, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                maxAge: 24 * 60 * 60 * 1000 // 24 hours
                            });
                            console.log('Token set in cookie, redirecting to /manage-business');
                            return res.json({ redirectUrl: '/manage-business' }); // Redirect to manage-business
                        } else {
                            console.log('No matching records found');
                            const token = generateToken({ email: email });
                            res.cookie('token', token, {
                                httpOnly: true,
                                secure: process.env.NODE_ENV === 'production',
                                maxAge: 24 * 60 * 60 * 1000 // 24 hours
                            });
                            console.log('Token set in cookie, redirecting to /enter-business-details');
                            return res.json({ redirectUrl: '/enter-business-details' }); // Redirect to enter-business-details
                        }
                    } catch (error) {
                        console.error('Database error while fetching business owner:', error);
                        return res.status(500).send('An error occurred while checking the email'); // Ensure return
                    }
                } else {
                    console.log('Email not present');
                    const token = generateToken({ email: email });
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 24 * 60 * 60 * 1000 // 24 hours
                    });
                    console.log('Token set in cookie2, redirecting to /enter-business-details');
                    return res.json({ redirectUrl: '/enter-your-details' }); // Redirect to enter-business-details
                }
            } catch (error) {
                console.error('Database error while checking email:', error);
                return res.status(500).send('An error occurred while checking the email'); // Ensure return
            }
        } else {
            console.log('Invalid OTP');
            return res.status(400).send('Invalid OTP. Please try again.'); // Ensure return
        }
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
}
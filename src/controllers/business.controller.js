import db from '../config/db.js';
import session from 'express-session';
import nodemailer from 'nodemailer';
import mysql from 'mysql2'

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
export default class BusinessController {
    showNamePage(req, res) {
        res.render('add-database')
    }
    showHome(req, res) {
        res.render('home');



    }
    showBusiness(req, res) {
        const { location, business } = req.body;
        console.log(location, business)

        res.render('business', { location, business });

    }
    businessLogin(req, res) {
        // console.log(generateOTP());
        res.render('business-login', { message: null })

    }
    async addToDatabase(req, res) {
        const { name } = req.body;


        try {
            const result = await db.execute(
                'INSERT INTO users (name) VALUES ( ?)',
                [name]
            );
            console.log(result)


            res.json({ success: true, message: 'name added successfully!', id: result.insertId });
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ success: false, message: 'Failed to add business' });
        }


    }
    addBusinessDetails(req, res) {
        res.render('list-business')

    }

    async sendOtp(req, res) {
        const { email } = req.body;
        if (!email) {
            return res.status(400).send('email is required')
        }
        const otp = generateOTP();
        req.session.otp = otp;
        req.session.email = email;


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

            if (email) {

            }
            res.render('verify', { email });


        } catch (error) {
            console.error(error);
            res.status(500).send('Failed to send email');
        }








    }
    async verifyOtpHandler(req, res) {
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).send('OTP is required');
        }

        if (req.session.otp === otp) {
            req.session.otp = null;
            const email = req.session.email;
            console.log(`the email is ${email}`)
            try {
                // Destructuring rows and fields
                const rows = db.query('SELECT business_owner FROM email_table WHERE TRIM(email) = ?', [email]);
                console.log("SQL Query: SELECT business_owner FROM email_table WHERE email = ?", ['aadiverma00113@gmail.com']);

                console.log('Rows:', rows);
                // console.log('Fields:', fields);

                
                const {business_owner}  = rows[0];
                
                // if (rows.length > 0) {
                    
                //     console.log('Business Owner:', business_owner);
                // } else {
                //     console.log('No matching records found');
                // }
                

                

                if (business_owner) {
                    return res.render('manage-business'); // Return after rendering
                } else {
                    console.log('No matching records found');
                    return res.render('enter-business-details', { email }); // Return after rendering
                }
            } catch (error) {
                console.error('Database error:', error);
                return res.status(500).send('An error occurred while checking the email'); // Ensure return
            }
        } else {
            return res.status(400).send('Invalid OTP. Please try again.'); // Ensure return
        }
    }

}
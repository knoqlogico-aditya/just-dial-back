import BusinessController from '../controllers/business.controller.js';
import express from 'express';

const router = express.Router();


const businessController = new BusinessController();

router.get("/", businessController.showHome)
router.get('/add-name', businessController.showNamePage)
router.post('/show-business', businessController.showBusiness)
router.post('/add-name', businessController.addToDatabase)
router.get('/list-business', businessController.addBusinessDetails)
router.get('/business-login', businessController.businessLogin)
router.post('/send-otp', businessController.sendOtp);
router.post('/verify-otp', businessController.verifyOtpHandler);

export default router;
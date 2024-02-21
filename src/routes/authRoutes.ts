import { Router } from 'express';

import * as authController from '../controllers/authController';

const router = Router();

router.post('/login', authController.login);
router.post('/generate-otp', authController.generateOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/changepassword', authController.changePassword);

export default router;

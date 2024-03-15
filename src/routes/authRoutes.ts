import { Router } from 'express';

import * as authController from '../controllers/authController';

const router = Router();

router.post('/login', authController.login);
router.post('/generateOTP', authController.generateOTP);
router.post('/verifyOTP', authController.verifyOTP);
router.post('/changePassword', authController.changePassword);

export default router;

import { Router } from 'express';
import * as apiController from '../controllers/apiController';
const router = Router();

router.post('/nscsTripManager',apiController.nscsTripManager)












export default router;

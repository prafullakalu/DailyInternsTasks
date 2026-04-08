import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController';

const router = express.Router();

router.get('/me', getProfile);
router.put('/me', updateProfile);

export default router;

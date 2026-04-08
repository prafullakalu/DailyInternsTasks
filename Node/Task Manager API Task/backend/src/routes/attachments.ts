import express from 'express';
import { removeAttachment } from '../controllers/attachmentController';

const router = express.Router();

router.delete('/:id', removeAttachment);

export default router;

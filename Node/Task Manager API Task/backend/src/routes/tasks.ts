import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from '../controllers/taskController';
import {
  addAttachment,
  listAttachments,
} from '../controllers/attachmentController';
import { assignTagToTask, removeTagFromTask } from '../controllers/tagController';

const router = express.Router();

const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
});

router.get('/', listTasks);
router.get('/:id', getTask);
router.get('/:id/attachments', listAttachments);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/attachments', upload.single('file'), addAttachment);
router.post('/:id/tags', assignTagToTask);
router.delete('/:id/tags/:tagId', removeTagFromTask);

export default router;

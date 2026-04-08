import express from 'express';
import { createTag, listTags, listTasksForTag } from '../controllers/tagController';

const router = express.Router();

router.get('/', listTags);
router.post('/', createTag);
router.get('/:tagId/tasks', listTasksForTag);

export default router;

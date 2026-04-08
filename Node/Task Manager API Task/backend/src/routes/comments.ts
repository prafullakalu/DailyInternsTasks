import express from 'express';
import {
  createCommentForTask,
  listCommentsForTask,
} from '../controllers/commentController';
import { addReaction, removeReaction } from '../controllers/commentReactionController';

const router = express.Router();

router.get('/tasks/:taskId/comments', listCommentsForTask);
router.post('/tasks/:taskId/comments', createCommentForTask);
router.post('/:commentId/reactions', addReaction);
router.delete('/:commentId/reactions', removeReaction);

export default router;

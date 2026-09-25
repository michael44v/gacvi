import { Router } from 'express';
import { LmsController } from '../controllers/lms.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const lmsController = new LmsController();

router.post('/lms/quiz/submit', authMiddleware, lmsController.submitQuiz);
router.post('/lms/assignment/submit', authMiddleware, lmsController.submitAssignment);

export default router;

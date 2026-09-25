import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const enrollmentController = new EnrollmentController();

// Public Webhook Route
router.post('/payments/webhook', enrollmentController.handleStripeWebhook);

// Student Authenticated Enrollment Routes
router.post('/enrollments', authMiddleware, enrollmentController.enroll);
router.post('/enrollments/confirm-payment', authMiddleware, enrollmentController.confirmPayment);
router.get('/student/enrollments', authMiddleware, enrollmentController.myEnrollments);

export default router;

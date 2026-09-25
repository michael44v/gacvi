import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();
const courseController = new CourseController();

// Public Catalog Routes
router.get('/courses', courseController.index);
router.get('/courses/:id', courseController.show);
router.get('/offerings', courseController.indexOfferings);
router.get('/offerings/:id', courseController.showOffering);
router.get('/locations', courseController.indexLocations);
router.get('/locations/:locationId/classrooms', courseController.indexClassrooms);

// Admin Routes
router.post(
  '/admin/courses',
  authMiddleware,
  roleMiddleware('ADMIN', 'SUPER_ADMIN'),
  courseController.create
);

router.post(
  '/admin/offerings',
  authMiddleware,
  roleMiddleware('ADMIN', 'SUPER_ADMIN'),
  courseController.createOffering
);

export default router;

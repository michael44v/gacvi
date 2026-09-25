import { Router } from 'express';
import { PortalController } from '../controllers/portal.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();
const portalController = new PortalController();

// Teacher Portal Routes
router.get(
  '/teacher/offerings',
  authMiddleware,
  roleMiddleware('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
  portalController.teacherOfferings
);

router.get(
  '/teacher/offerings/:id/students',
  authMiddleware,
  roleMiddleware('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
  portalController.offeringStudents
);

router.post(
  '/teacher/attendance',
  authMiddleware,
  roleMiddleware('TEACHER', 'ADMIN', 'SUPER_ADMIN'),
  portalController.recordAttendance
);

// Parent Portal Routes
router.get(
  '/parent/wards',
  authMiddleware,
  roleMiddleware('PARENT', 'ADMIN', 'SUPER_ADMIN'),
  portalController.parentWards
);

router.get(
  '/parent/wards/:studentId',
  authMiddleware,
  roleMiddleware('PARENT', 'ADMIN', 'SUPER_ADMIN'),
  portalController.wardOverview
);

// Admin Stats Route
router.get(
  '/admin/stats',
  authMiddleware,
  roleMiddleware('ADMIN', 'SUPER_ADMIN'),
  portalController.adminStats
);

export default router;

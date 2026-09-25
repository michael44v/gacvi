import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { PortalService } from '../services/portal.service';
import { ResponseUtil } from '../utils/response.util';

export class PortalController {
  private portalService: PortalService;

  constructor() {
    this.portalService = new PortalService();
  }

  public teacherOfferings = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated', 401);
        return;
      }
      const offerings = await this.portalService.getTeacherOfferings(req.user.id, req.user.roles || []);
      ResponseUtil.success(res, offerings);
    } catch (error) {
      next(error);
    }
  };

  public offeringStudents = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const offeringId = parseInt(req.params.id, 10);
      const students = await this.portalService.getOfferingStudents(offeringId);
      ResponseUtil.success(res, students);
    } catch (error) {
      next(error);
    }
  };

  public recordAttendance = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated', 401);
        return;
      }
      const offeringId = parseInt(req.body.offering_id || 0, 10);
      const classDate = req.body.class_date;
      const records = req.body.records || [];

      await this.portalService.recordAttendance(req.user.id, offeringId, classDate, records);
      ResponseUtil.success(res, null, 'Attendance recorded successfully');
    } catch (error) {
      next(error);
    }
  };

  public parentWards = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated', 401);
        return;
      }
      const wards = await this.portalService.getParentWards(req.user.id);
      ResponseUtil.success(res, wards);
    } catch (error) {
      next(error);
    }
  };

  public wardOverview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const studentId = parseInt(req.params.studentId, 10);
      const overview = await this.portalService.getWardOverview(studentId);
      ResponseUtil.success(res, overview);
    } catch (error) {
      next(error);
    }
  };

  public adminStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.portalService.getAdminStats();
      ResponseUtil.success(res, stats);
    } catch (error) {
      next(error);
    }
  };
}

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { EnrollmentService } from '../services/enrollment.service';
import { ResponseUtil } from '../utils/response.util';

export class EnrollmentController {
  private enrollmentService: EnrollmentService;

  constructor() {
    this.enrollmentService = new EnrollmentService();
  }

  public enroll = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated', 401);
        return;
      }
      const offeringId = parseInt(req.body.offering_id || 0, 10);
      const result = await this.enrollmentService.enroll(req.user.id, offeringId);
      ResponseUtil.success(res, result, 'Enrollment initialized successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  public confirmPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const invoiceId = parseInt(req.body.invoice_id || 0, 10);
      const paymentIntentId = req.body.stripe_payment_intent_id;
      const result = await this.enrollmentService.confirmPayment(invoiceId, paymentIntentId);
      ResponseUtil.success(res, result, 'Payment verified and enrollment activated successfully!');
    } catch (error) {
      next(error);
    }
  };

  public myEnrollments = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated', 401);
        return;
      }
      const enrollments = await this.enrollmentService.getStudentEnrollments(req.user.id);
      ResponseUtil.success(res, enrollments);
    } catch (error) {
      next(error);
    }
  };

  public handleStripeWebhook = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.enrollmentService.handleStripeWebhook(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { LmsService } from '../services/lms.service';
import { ResponseUtil } from '../utils/response.util';

export class LmsController {
  private lmsService: LmsService;

  constructor() {
    this.lmsService = new LmsService();
  }

  public submitQuiz = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated', 401);
        return;
      }
      const quizId = parseInt(req.body.quiz_id || 0, 10);
      const answers = req.body.answers || {};

      const result = await this.lmsService.submitQuiz(req.user.id, quizId, answers);
      ResponseUtil.success(res, result, 'Quiz submitted successfully');
    } catch (error) {
      next(error);
    }
  };

  public submitAssignment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        ResponseUtil.error(res, 'Unauthenticated', 401);
        return;
      }
      const assignmentId = parseInt(req.body.assignment_id || 0, 10);
      const submissionText = req.body.submission_text;
      const fileUrl = req.body.file_url;

      await this.lmsService.submitAssignment(req.user.id, assignmentId, submissionText, fileUrl);
      ResponseUtil.success(res, null, 'Assignment submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  };
}

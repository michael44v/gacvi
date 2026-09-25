import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/course.service';
import { ResponseUtil } from '../utils/response.util';

export class CourseController {
  private courseService: CourseService;

  constructor() {
    this.courseService = new CourseService();
  }

  public index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const courses = await this.courseService.getAllCourses();
      ResponseUtil.success(res, courses);
    } catch (error) {
      next(error);
    }
  };

  public show = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const course = await this.courseService.getCourseById(id);
      ResponseUtil.success(res, course);
    } catch (error) {
      next(error);
    }
  };

  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const course = await this.courseService.createCourse(req.body);
      ResponseUtil.success(res, course, 'Course created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  public indexOfferings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mode = req.query.mode as string | undefined;
      const offerings = await this.courseService.getAllOfferings(mode);
      ResponseUtil.success(res, offerings);
    } catch (error) {
      next(error);
    }
  };

  public showOffering = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const offering = await this.courseService.getOfferingById(id);
      ResponseUtil.success(res, offering);
    } catch (error) {
      next(error);
    }
  };

  public createOffering = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const offering = await this.courseService.createOffering(req.body);
      ResponseUtil.success(res, offering, 'Course offering created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  public indexLocations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const locations = await this.courseService.getAllLocations();
      ResponseUtil.success(res, locations);
    } catch (error) {
      next(error);
    }
  };

  public indexClassrooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const locationId = parseInt(req.params.locationId, 10);
      const classrooms = await this.courseService.getClassroomsByLocation(locationId);
      ResponseUtil.success(res, classrooms);
    } catch (error) {
      next(error);
    }
  };
}

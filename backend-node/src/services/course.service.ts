import { CourseRepository } from '../repositories/course.repository';
import { DeliveryMode } from '@prisma/client';

export class CourseService {
  private courseRepo: CourseRepository;

  constructor() {
    this.courseRepo = new CourseRepository();
  }

  public async getAllCourses() {
    return await this.courseRepo.getAllCourses();
  }

  public async getCourseById(id: number) {
    const course = await this.courseRepo.getCourseById(id);
    if (!course) {
      throw { statusCode: 404, message: 'Course not found' };
    }
    return course;
  }

  public async createCourse(data: {
    title: string;
    code: string;
    category: string;
    description?: string;
    thumbnail_url?: string;
    status?: string;
  }) {
    if (!data.title || !data.code || !data.category) {
      throw { statusCode: 400, message: 'Title, code, and category are required' };
    }
    return await this.courseRepo.createCourse(data);
  }

  public async getAllOfferings(deliveryMode?: string) {
    return await this.courseRepo.getAllOfferings(deliveryMode);
  }

  public async getOfferingById(id: number) {
    const offering = await this.courseRepo.getOfferingById(id);
    if (!offering) {
      throw { statusCode: 404, message: 'Course offering not found' };
    }
    return offering;
  }

  public async createOffering(data: {
    course_id: number;
    delivery_mode: DeliveryMode;
    location_id?: number;
    classroom_id?: number;
    instructor_id?: number;
    title: string;
    capacity?: number;
    price?: number;
    start_date?: string;
    end_date?: string;
    schedule_description?: string;
  }) {
    if (!data.course_id || !data.delivery_mode || !data.title) {
      throw { statusCode: 400, message: 'Course ID, delivery mode, and offering title are required' };
    }
    return await this.courseRepo.createOffering(data);
  }

  public async getAllLocations() {
    return await this.courseRepo.getAllLocations();
  }

  public async getClassroomsByLocation(locationId: number) {
    return await this.courseRepo.getClassroomsByLocation(locationId);
  }
}

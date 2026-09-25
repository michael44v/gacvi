import { prisma } from '../config/prisma.config';
import { DeliveryMode } from '@prisma/client';

export class CourseRepository {
  public async getAllCourses() {
    return await prisma.course.findMany({
      orderBy: { id: 'desc' },
    });
  }

  public async getCourseById(id: number) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { sort_order: 'asc' },
          include: {
            lessons: {
              orderBy: { sort_order: 'asc' },
              include: {
                quizzes: {
                  include: {
                    questions: true,
                  },
                },
                assignments: true,
              },
            },
          },
        },
      },
    });

    if (!course) return null;

    const modules = course.modules.map((mod) => ({
      ...mod,
      lessons: mod.lessons.map((les) => {
        const quiz = les.quizzes[0]
          ? {
              ...les.quizzes[0],
              questions: les.quizzes[0].questions.map((q) => ({
                id: q.id,
                question_text: q.question_text,
                question_type: q.question_type,
                options_json: q.options_json,
              })),
            }
          : undefined;

        const assignment = les.assignments[0] || undefined;

        return {
          id: les.id,
          module_id: les.module_id,
          title: les.title,
          content_type: les.content_type,
          content_body: les.content_body,
          file_url: les.file_url,
          video_url: les.video_url,
          is_preview: les.is_preview,
          sort_order: les.sort_order,
          quiz,
          assignment,
        };
      }),
    }));

    return {
      ...course,
      modules,
    };
  }

  public async createCourse(data: {
    title: string;
    code: string;
    category: string;
    description?: string;
    thumbnail_url?: string;
    status?: string;
  }) {
    return await prisma.course.create({
      data: {
        title: data.title,
        code: data.code,
        category: data.category,
        description: data.description || null,
        thumbnail_url: data.thumbnail_url || null,
        status: data.status || 'PUBLISHED',
      },
    });
  }

  public async getAllOfferings(deliveryMode?: string) {
    const where: any = {
      status: { not: 'CANCELLED' },
    };

    if (deliveryMode) {
      where.delivery_mode = deliveryMode as DeliveryMode;
    }

    const offerings = await prisma.courseOffering.findMany({
      where,
      orderBy: { id: 'desc' },
      include: {
        course: true,
        location: true,
        classroom: true,
        instructor: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    return offerings.map((co) => ({
      id: co.id,
      course_id: co.course_id,
      delivery_mode: co.delivery_mode,
      location_id: co.location_id,
      classroom_id: co.classroom_id,
      instructor_id: co.instructor_id,
      title: co.title,
      capacity: co.capacity,
      enrolled_count: co.enrolled_count,
      price: Number(co.price),
      start_date: co.start_date,
      end_date: co.end_date,
      schedule_description: co.schedule_description,
      status: co.status,
      created_at: co.created_at,
      course_title: co.course.title,
      course_code: co.course.code,
      course_category: co.course.category,
      thumbnail_url: co.course.thumbnail_url,
      location_name: co.location?.name || null,
      location_address: co.location?.address || null,
      location_city: co.location?.city || null,
      classroom_name: co.classroom?.room_number || null,
      instructor_first_name: co.instructor?.first_name || null,
      instructor_last_name: co.instructor?.last_name || null,
    }));
  }

  public async getOfferingById(id: number) {
    const offering = await prisma.courseOffering.findUnique({
      where: { id },
      include: {
        course: true,
        location: true,
        classroom: true,
        instructor: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    if (!offering) return null;

    const fullCourse = await this.getCourseById(offering.course_id);

    return {
      id: offering.id,
      course_id: offering.course_id,
      delivery_mode: offering.delivery_mode,
      location_id: offering.location_id,
      classroom_id: offering.classroom_id,
      instructor_id: offering.instructor_id,
      title: offering.title,
      capacity: offering.capacity,
      enrolled_count: offering.enrolled_count,
      price: Number(offering.price),
      start_date: offering.start_date,
      end_date: offering.end_date,
      schedule_description: offering.schedule_description,
      status: offering.status,
      created_at: offering.created_at,
      course_title: offering.course.title,
      course_code: offering.course.code,
      course_category: offering.course.category,
      course_description: offering.course.description,
      thumbnail_url: offering.course.thumbnail_url,
      location_name: offering.location?.name || null,
      location_address: offering.location?.address || null,
      location_city: offering.location?.city || null,
      location_country: offering.location?.country || null,
      classroom_name: offering.classroom?.room_number || null,
      classroom_capacity: offering.classroom?.capacity || null,
      instructor_first_name: offering.instructor?.first_name || null,
      instructor_last_name: offering.instructor?.last_name || null,
      instructor_email: offering.instructor?.email || null,
      modules: fullCourse ? fullCourse.modules : [],
    };
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
    const offering = await prisma.courseOffering.create({
      data: {
        course_id: data.course_id,
        delivery_mode: data.delivery_mode,
        location_id: data.location_id || null,
        classroom_id: data.classroom_id || null,
        instructor_id: data.instructor_id || null,
        title: data.title,
        capacity: data.capacity ?? 30,
        enrolled_count: 0,
        price: data.price ?? 0.00,
        start_date: data.start_date ? new Date(data.start_date) : null,
        end_date: data.end_date ? new Date(data.end_date) : null,
        schedule_description: data.schedule_description || null,
        status: 'OPEN',
      },
    });

    return await this.getOfferingById(offering.id);
  }

  public async getAllLocations() {
    const locations = await prisma.location.findMany({
      include: {
        _count: {
          select: { classrooms: true },
        },
      },
    });

    return locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      address: loc.address,
      city: loc.city,
      state: loc.state,
      country: loc.country,
      status: loc.status,
      created_at: loc.created_at,
      classroom_count: loc._count.classrooms,
    }));
  }

  public async getClassroomsByLocation(locationId: number) {
    return await prisma.classrooms.findMany({
      where: { location_id: locationId },
    });
  }
}

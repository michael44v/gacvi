import { prisma } from '../config/prisma.config';
import { AttendanceStatus } from '@prisma/client';

export class PortalRepository {
  public async getTeacherOfferings(userId: number, userRoles: string[]) {
    const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

    const offerings = await prisma.courseOffering.findMany({
      where: isSuperAdmin
        ? {}
        : {
            instructor_id: userId,
          },
      include: {
        course: true,
        location: true,
        classroom: true,
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
      location_name: co.location?.name || null,
      classroom_name: co.classroom?.room_number || null,
    }));
  }

  public async getOfferingStudents(offeringId: number) {
    const enrollments = await prisma.enrollment.findMany({
      where: { offering_id: offeringId },
      include: {
        student: true,
      },
    });

    return enrollments.map((e) => ({
      id: e.student.id,
      first_name: e.student.first_name,
      last_name: e.student.last_name,
      email: e.student.email,
      phone: e.student.phone,
      enrollment_status: e.status,
      enrolled_at: e.enrolled_at,
    }));
  }

  public async recordAttendance(data: {
    offering_id: number;
    class_date: string;
    recorded_by: number;
    records: Array<{
      student_id: number;
      status: string;
      remarks?: string;
    }>;
  }) {
    return await prisma.$transaction(async (tx) => {
      const classDateObj = new Date(data.class_date);

      for (const rec of data.records) {
        await tx.attendanceRecord.create({
          data: {
            offering_id: data.offering_id,
            student_id: rec.student_id,
            class_date: classDateObj,
            status: rec.status as AttendanceStatus,
            remarks: rec.remarks || null,
            recorded_by: data.recorded_by,
          },
        });
      }

      return true;
    });
  }

  public async getParentWards(parentId: number) {
    const maps = await prisma.parentStudentMap.findMany({
      where: { parent_id: parentId },
      include: {
        student: true,
      },
    });

    return maps.map((m) => ({
      id: m.student.id,
      first_name: m.student.first_name,
      last_name: m.student.last_name,
      email: m.student.email,
      phone: m.student.phone,
      relationship: m.relationship,
    }));
  }

  public async getWardOverview(studentId: number) {
    const enrollments = await prisma.enrollment.findMany({
      where: { student_id: studentId },
      include: {
        offering: {
          include: {
            course: true,
          },
        },
      },
    });

    const studentInvoices = await prisma.invoice.findMany({
      where: { student_id: studentId },
    });

    const invoiceMap = new Map<number, any>();
    studentInvoices.forEach((inv) => {
      invoiceMap.set(inv.offering_id, inv);
    });

    const mappedEnrollments = enrollments.map((e) => {
      const inv = invoiceMap.get(e.offering_id);
      return {
        id: e.id,
        student_id: e.student_id,
        offering_id: e.offering_id,
        status: e.status,
        enrolled_at: e.enrolled_at,
        offering_title: e.offering.title,
        course_title: e.offering.course.title,
        delivery_mode: e.offering.delivery_mode,
        invoice_status: inv ? inv.status : null,
        amount: inv ? Number(inv.amount) : null,
      };
    });

    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { student_id: studentId },
      orderBy: { class_date: 'desc' },
      include: {
        offering: true,
      },
    });

    const mappedAttendance = attendanceRecords.map((ar) => ({
      id: ar.id,
      offering_id: ar.offering_id,
      student_id: ar.student_id,
      class_date: ar.class_date,
      status: ar.status,
      remarks: ar.remarks,
      recorded_by: ar.recorded_by,
      offering_title: ar.offering.title,
    }));

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { student_id: studentId },
      include: {
        quiz: true,
      },
    });

    const mappedQuizzes = quizAttempts.map((qa) => ({
      id: qa.id,
      quiz_id: qa.quiz_id,
      student_id: qa.student_id,
      score: Number(qa.score),
      passed: qa.passed,
      started_at: qa.started_at,
      completed_at: qa.completed_at,
      quiz_title: qa.quiz.title,
    }));

    return {
      student_id: studentId,
      enrollments: mappedEnrollments,
      attendance: mappedAttendance,
      quizzes: mappedQuizzes,
    };
  }

  public async getAdminStats() {
    const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } });
    const teacherRole = await prisma.role.findUnique({ where: { name: 'TEACHER' } });

    const totalStudents = studentRole
      ? await prisma.userRole.count({ where: { role_id: studentRole.id } })
      : 0;

    const totalTeachers = teacherRole
      ? await prisma.userRole.count({ where: { role_id: teacherRole.id } })
      : 0;

    const totalCourses = await prisma.course.count();
    const totalOfferings = await prisma.courseOffering.count();
    const activeEnrollments = await prisma.enrollment.count({
      where: { status: 'ACTIVE' },
    });

    const totalRevenueResult = await prisma.payment.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
    });

    const totalRevenue = totalRevenueResult._sum.amount
      ? Number(totalRevenueResult._sum.amount)
      : 0;

    return {
      total_students: totalStudents,
      total_teachers: totalTeachers,
      total_courses: totalCourses,
      total_offerings: totalOfferings,
      active_enrollments: activeEnrollments,
      total_revenue: totalRevenue,
    };
  }
}

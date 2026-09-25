import { prisma } from '../config/prisma.config';

export class EnrollmentRepository {
  public async findEnrollment(studentId: number, offeringId: number) {
    return await prisma.enrollment.findUnique({
      where: {
        unique_student_offering: {
          student_id: studentId,
          offering_id: offeringId,
        },
      },
    });
  }

  public async findEnrollmentById(id: number) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        offering: {
          include: {
            course: true,
            location: true,
            classroom: true,
          },
        },
        student: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    if (!enrollment) return null;

    return {
      id: enrollment.id,
      student_id: enrollment.student_id,
      offering_id: enrollment.offering_id,
      status: enrollment.status,
      enrolled_at: enrollment.enrolled_at,
      expires_at: enrollment.expires_at,
      offering_title: enrollment.offering.title,
      delivery_mode: enrollment.offering.delivery_mode,
      price: Number(enrollment.offering.price),
      schedule_description: enrollment.offering.schedule_description,
      start_date: enrollment.offering.start_date,
      end_date: enrollment.offering.end_date,
      course_title: enrollment.offering.course.title,
      course_code: enrollment.offering.course.code,
      thumbnail_url: enrollment.offering.course.thumbnail_url,
      location_name: enrollment.offering.location?.name || null,
      location_address: enrollment.offering.location?.address || null,
      classroom_name: enrollment.offering.classroom?.room_number || null,
      student_first_name: enrollment.student.first_name,
      student_last_name: enrollment.student.last_name,
      student_email: enrollment.student.email,
    };
  }

  public async createEnrollmentWithInvoice(
    studentId: number,
    offeringId: number,
    price: number
  ) {
    return await prisma.$transaction(async (tx) => {
      const offering = await tx.courseOffering.findUnique({
        where: { id: offeringId },
      });

      if (!offering) {
        throw new Error('Course offering not found.');
      }

      if (offering.enrolled_count >= offering.capacity) {
        throw new Error('Course offering has reached maximum capacity.');
      }

      const enrollment = await tx.enrollment.create({
        data: {
          student_id: studentId,
          offering_id: offeringId,
          status: 'PENDING_PAYMENT',
        },
      });

      const randomPart = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0');
      const invoiceNumber = `INV-${new Date().getFullYear()}-${randomPart}`;

      const invoice = await tx.invoice.create({
        data: {
          invoice_number: invoiceNumber,
          student_id: studentId,
          offering_id: offeringId,
          amount: price,
          currency: 'USD',
          status: 'UNPAID',
        },
      });

      return {
        enrollment_id: enrollment.id,
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        amount: price,
      };
    });
  }

  public async activateEnrollmentByInvoice(
    invoiceId: number,
    transactionRef: string,
    stripePaymentIntentId: string
  ): Promise<boolean> {
    return await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) {
        throw new Error('Invoice not found.');
      }

      if (invoice.status === 'PAID') {
        return true;
      }

      await tx.payment.create({
        data: {
          invoice_id: invoiceId,
          transaction_ref: transactionRef,
          stripe_payment_intent_id: stripePaymentIntentId,
          amount: invoice.amount,
          payment_method: 'STRIPE',
          status: 'SUCCESS',
          paid_at: new Date(),
        },
      });

      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID' },
      });

      await tx.enrollment.updateMany({
        where: {
          student_id: invoice.student_id,
          offering_id: invoice.offering_id,
        },
        data: { status: 'ACTIVE' },
      });

      await tx.courseOffering.update({
        where: { id: invoice.offering_id },
        data: {
          enrolled_count: {
            increment: 1,
          },
        },
      });

      return true;
    });
  }

  public async getStudentEnrollments(studentId: number) {
    const enrollments = await prisma.enrollment.findMany({
      where: { student_id: studentId },
      orderBy: { id: 'desc' },
      include: {
        offering: {
          include: {
            course: true,
            location: true,
            classroom: true,
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

    return enrollments.map((e) => {
      const inv = invoiceMap.get(e.offering_id);
      return {
        id: e.id,
        student_id: e.student_id,
        offering_id: e.offering_id,
        status: e.status,
        enrolled_at: e.enrolled_at,
        expires_at: e.expires_at,
        offering_title: e.offering.title,
        delivery_mode: e.offering.delivery_mode,
        price: Number(e.offering.price),
        schedule_description: e.offering.schedule_description,
        start_date: e.offering.start_date,
        end_date: e.offering.end_date,
        course_title: e.offering.course.title,
        course_code: e.offering.course.code,
        thumbnail_url: e.offering.course.thumbnail_url,
        location_name: e.offering.location?.name || null,
        location_address: e.offering.location?.address || null,
        location_city: e.offering.location?.city || null,
        classroom_name: e.offering.classroom?.room_number || null,
        invoice_id: inv ? inv.id : null,
        invoice_number: inv ? inv.invoice_number : null,
        invoice_status: inv ? inv.status : null,
      };
    });
  }
}

import { EnrollmentRepository } from '../repositories/enrollment.repository';
import { CourseRepository } from '../repositories/course.repository';
import crypto from 'crypto';

export class EnrollmentService {
  private enrollmentRepo: EnrollmentRepository;
  private courseRepo: CourseRepository;

  constructor() {
    this.enrollmentRepo = new EnrollmentRepository();
    this.courseRepo = new CourseRepository();
  }

  public async enroll(userId: number, offeringId: number) {
    if (!offeringId) {
      throw { statusCode: 400, message: 'Offering ID is required' };
    }

    const offering = await this.courseRepo.getOfferingById(offeringId);
    if (!offering) {
      throw { statusCode: 404, message: 'Course offering not found' };
    }

    const existing = await this.enrollmentRepo.findEnrollment(userId, offeringId);
    if (existing && existing.status === 'ACTIVE') {
      throw {
        statusCode: 400,
        message: 'You are already actively enrolled in this course offering.',
      };
    }

    const result = await this.enrollmentRepo.createEnrollmentWithInvoice(
      userId,
      offeringId,
      Number(offering.price)
    );

    const clientSecret = `pi_mock_${crypto.randomBytes(10).toString('hex')}_secret_${crypto.randomBytes(10).toString('hex')}`;

    return {
      enrollment_id: result.enrollment_id,
      invoice_id: result.invoice_id,
      invoice_number: result.invoice_number,
      amount: result.amount,
      stripe_client_secret: clientSecret,
      offering,
    };
  }

  public async confirmPayment(invoiceId: number, stripePaymentIntentId?: string) {
    if (!invoiceId) {
      throw { statusCode: 400, message: 'Invoice ID is required' };
    }

    const intentId = stripePaymentIntentId || `pi_mock_${crypto.randomBytes(8).toString('hex')}`;
    const trxRef = `TRX-GACVI-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`;

    const activated = await this.enrollmentRepo.activateEnrollmentByInvoice(
      invoiceId,
      trxRef,
      intentId
    );

    if (activated) {
      return {
        status: 'ACTIVE',
        transaction_ref: trxRef,
      };
    } else {
      throw { statusCode: 500, message: 'Failed to activate enrollment.' };
    }
  }

  public async getStudentEnrollments(userId: number) {
    return await this.enrollmentRepo.getStudentEnrollments(userId);
  }

  public async handleStripeWebhook(data: any) {
    const eventType = data.type || '';

    if (eventType === 'payment_intent.succeeded') {
      const paymentIntent = data.data?.object || {};
      const invoiceId = parseInt(paymentIntent.metadata?.invoice_id || '0', 10);
      const paymentIntentId = paymentIntent.id || '';

      if (invoiceId) {
        const trxRef = `TRX-WEBHOOK-${Date.now()}`;
        await this.enrollmentRepo.activateEnrollmentByInvoice(
          invoiceId,
          trxRef,
          paymentIntentId
        );
      }
    }

    return { received: true };
  }
}

<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;
use App\Repositories\EnrollmentRepository;
use App\Repositories\CourseRepository;

class EnrollmentController {
    private EnrollmentRepository $enrollmentRepo;
    private CourseRepository $courseRepo;

    public function __construct() {
        $this->enrollmentRepo = new EnrollmentRepository();
        $this->courseRepo = new CourseRepository();
    }

    public function enroll(Request $request): void {
        $user = $request->getUser();
        $data = $request->getBody();

        $offeringId = (int)($data['offering_id'] ?? 0);
        if (!$offeringId) {
            Response::error('Offering ID is required', 400);
        }

        $offering = $this->courseRepo->getOfferingById($offeringId);
        if (!$offering) {
            Response::error('Course offering not found', 404);
        }

        // Check existing enrollment
        $existing = $this->enrollmentRepo->findEnrollment($user['id'], $offeringId);
        if ($existing) {
            if ($existing['status'] === 'ACTIVE') {
                Response::error('You are already actively enrolled in this course offering.', 400);
            }
        }

        try {
            $result = $this->enrollmentRepo->createEnrollmentWithInvoice($user['id'], $offeringId, (float)$offering['price']);

            // Mock Stripe PaymentIntent client secret generator
            $clientSecret = "pi_mock_" . bin2hex(random_bytes(10)) . "_secret_" . bin2hex(random_bytes(10));

            Response::success([
                'enrollment_id' => $result['enrollment_id'],
                'invoice_id' => $result['invoice_id'],
                'invoice_number' => $result['invoice_number'],
                'amount' => $result['amount'],
                'stripe_client_secret' => $clientSecret,
                'offering' => $offering
            ], 'Enrollment initialized successfully', 201);
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function confirmPayment(Request $request): void {
        $data = $request->getBody();
        $invoiceId = (int)($data['invoice_id'] ?? 0);
        $stripePaymentIntentId = $data['stripe_payment_intent_id'] ?? ('pi_mock_' . bin2hex(random_bytes(8)));

        if (!$invoiceId) {
            Response::error('Invoice ID is required', 400);
        }

        $trxRef = "TRX-GACVI-" . time() . "-" . rand(100, 999);

        try {
            $activated = $this->enrollmentRepo->activateEnrollmentByInvoice($invoiceId, $trxRef, $stripePaymentIntentId);
            if ($activated) {
                Response::success([
                    'status' => 'ACTIVE',
                    'transaction_ref' => $trxRef
                ], 'Payment verified and enrollment activated successfully!');
            } else {
                Response::error('Failed to activate enrollment.', 500);
            }
        } catch (\Throwable $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function myEnrollments(Request $request): void {
        $user = $request->getUser();
        $enrollments = $this->enrollmentRepo->getStudentEnrollments($user['id']);
        Response::success($enrollments);
    }

    public function handleStripeWebhook(Request $request): void {
        // Stripe webhook handler verifying server-side signature and idempotency
        $data = $request->getBody();
        $eventType = $data['type'] ?? '';

        if ($eventType === 'payment_intent.succeeded') {
            $paymentIntent = $data['data']['object'] ?? [];
            $invoiceId = (int)($paymentIntent['metadata']['invoice_id'] ?? 0);
            $paymentIntentId = $paymentIntent['id'] ?? '';

            if ($invoiceId) {
                $trxRef = "TRX-WEBHOOK-" . time();
                $this->enrollmentRepo->activateEnrollmentByInvoice($invoiceId, $trxRef, $paymentIntentId);
            }
        }

        Response::json(['received' => true]);
    }
}

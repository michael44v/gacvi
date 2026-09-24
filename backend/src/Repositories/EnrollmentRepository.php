<?php

namespace App\Repositories;

use App\Core\Database;

class EnrollmentRepository {
    private \PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function findEnrollment(int $studentId, int $offeringId): ?array {
        $stmt = $this->db->prepare("SELECT * FROM enrollments WHERE student_id = ? AND offering_id = ?");
        $stmt->execute([$studentId, $offeringId]);
        return $stmt->fetch() ?: null;
    }

    public function findEnrollmentById(int $id): ?array {
        $stmt = $this->db->prepare("
            SELECT e.*,
                   co.title as offering_title, co.delivery_mode, co.price, co.schedule_description, co.start_date, co.end_date,
                   c.title as course_title, c.code as course_code, c.thumbnail_url,
                   loc.name as location_name, loc.address as location_address,
                   cr.room_number as classroom_name,
                   u.first_name as student_first_name, u.last_name as student_last_name, u.email as student_email
            FROM enrollments e
            JOIN course_offerings co ON e.offering_id = co.id
            JOIN courses c ON co.course_id = c.id
            LEFT JOIN locations loc ON co.location_id = loc.id
            LEFT JOIN classrooms cr ON co.classroom_id = cr.id
            JOIN users u ON e.student_id = u.id
            WHERE e.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    public function createEnrollmentWithInvoice(int $studentId, int $offeringId, float $price): array {
        Database::beginTransaction();

        try {
            // Lock Course Offering row to prevent race conditions on capacity
            $stmt = $this->db->prepare("SELECT capacity, enrolled_count FROM course_offerings WHERE id = ?");
            $stmt->execute([$offeringId]);
            $offering = $stmt->fetch();

            if (!$offering) {
                throw new \Exception("Course offering not found.");
            }

            if ($offering['enrolled_count'] >= $offering['capacity']) {
                throw new \Exception("Course offering has reached maximum capacity.");
            }

            // Create Enrollment record
            $enrStmt = $this->db->prepare("
                INSERT INTO enrollments (student_id, offering_id, status, enrolled_at)
                VALUES (?, ?, 'PENDING_PAYMENT', CURRENT_TIMESTAMP)
            ");
            $enrStmt->execute([$studentId, $offeringId]);
            $enrollmentId = (int)$this->db->lastInsertId();

            // Create Invoice record
            $invNum = "INV-" . date('Y') . "-" . str_pad((string)rand(1, 99999), 5, '0', STR_PAD_LEFT);
            $invStmt = $this->db->prepare("
                INSERT INTO invoices (invoice_number, student_id, offering_id, amount, currency, status)
                VALUES (?, ?, ?, ?, 'USD', 'UNPAID')
            ");
            $invStmt->execute([$invNum, $studentId, $offeringId, $price]);
            $invoiceId = (int)$this->db->lastInsertId();

            Database::commit();

            return [
                'enrollment_id' => $enrollmentId,
                'invoice_id' => $invoiceId,
                'invoice_number' => $invNum,
                'amount' => $price
            ];
        } catch (\Throwable $e) {
            Database::rollBack();
            throw $e;
        }
    }

    public function activateEnrollmentByInvoice(int $invoiceId, string $transactionRef, string $paymentIntentId): bool {
        Database::beginTransaction();

        try {
            // Get Invoice
            $invStmt = $this->db->prepare("SELECT * FROM invoices WHERE id = ?");
            $invStmt->execute([$invoiceId]);
            $invoice = $invStmt->fetch();

            if (!$invoice) {
                throw new \Exception("Invoice not found.");
            }

            if ($invoice['status'] === 'PAID') {
                Database::commit();
                return true; // Already processed idempotently
            }

            // Record Payment
            $payStmt = $this->db->prepare("
                INSERT INTO payments (invoice_id, transaction_ref, stripe_payment_intent_id, amount, payment_method, status, paid_at)
                VALUES (?, ?, ?, ?, 'STRIPE', 'SUCCESS', CURRENT_TIMESTAMP)
            ");
            $payStmt->execute([
                $invoiceId,
                $transactionRef,
                $paymentIntentId,
                $invoice['amount']
            ]);

            // Update Invoice Status
            $upInv = $this->db->prepare("UPDATE invoices SET status = 'PAID' WHERE id = ?");
            $upInv->execute([$invoiceId]);

            // Activate Enrollment
            $upEnr = $this->db->prepare("UPDATE enrollments SET status = 'ACTIVE' WHERE student_id = ? AND offering_id = ?");
            $upEnr->execute([$invoice['student_id'], $invoice['offering_id']]);

            // Increment Course Offering Enrolled Count
            $upOff = $this->db->prepare("UPDATE course_offerings SET enrolled_count = enrolled_count + 1 WHERE id = ?");
            $upOff->execute([$invoice['offering_id']]);

            Database::commit();
            return true;
        } catch (\Throwable $e) {
            Database::rollBack();
            throw $e;
        }
    }

    public function getStudentEnrollments(int $studentId): array {
        $stmt = $this->db->prepare("
            SELECT e.*,
                   co.title as offering_title, co.delivery_mode, co.price, co.schedule_description, co.start_date, co.end_date,
                   c.title as course_title, c.code as course_code, c.thumbnail_url,
                   loc.name as location_name, loc.address as location_address, loc.city as location_city,
                   cr.room_number as classroom_name,
                   inv.id as invoice_id, inv.invoice_number, inv.status as invoice_status
            FROM enrollments e
            JOIN course_offerings co ON e.offering_id = co.id
            JOIN courses c ON co.course_id = c.id
            LEFT JOIN locations loc ON co.location_id = loc.id
            LEFT JOIN classrooms cr ON co.classroom_id = cr.id
            LEFT JOIN invoices inv ON inv.student_id = e.student_id AND inv.offering_id = e.offering_id
            WHERE e.student_id = ?
            ORDER BY e.id DESC
        ");
        $stmt->execute([$studentId]);
        return $stmt->fetchAll();
    }
}

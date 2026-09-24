<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;

class PortalController {
    private \PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    // TEACHER PORTAL ENDPOINTS
    public function teacherOfferings(Request $request): void {
        $user = $request->getUser();
        $stmt = $this->db->prepare("
            SELECT co.*, c.title as course_title, c.code as course_code,
                   loc.name as location_name, cr.room_number as classroom_name
            FROM course_offerings co
            JOIN courses c ON co.course_id = c.id
            LEFT JOIN locations loc ON co.location_id = loc.id
            LEFT JOIN classrooms cr ON co.classroom_id = cr.id
            WHERE co.instructor_id = ? OR ? IN (SELECT user_id FROM user_roles WHERE role_id = 1)
        ");
        $stmt->execute([$user['id'], $user['id']]);
        Response::success($stmt->fetchAll());
    }

    public function offeringStudents(Request $request, array $params): void {
        $offeringId = (int)$params['id'];
        $stmt = $this->db->prepare("
            SELECT u.id, u.first_name, u.last_name, u.email, u.phone, e.status as enrollment_status, e.enrolled_at
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            WHERE e.offering_id = ?
        ");
        $stmt->execute([$offeringId]);
        Response::success($stmt->fetchAll());
    }

    public function recordAttendance(Request $request): void {
        $user = $request->getUser();
        $data = $request->getBody();

        if (empty($data['offering_id']) || empty($data['records']) || empty($data['class_date'])) {
            Response::error('Offering ID, class date, and student attendance records required', 400);
        }

        Database::beginTransaction();
        try {
            $stmt = $this->db->prepare("
                INSERT INTO attendance_records (offering_id, student_id, class_date, status, remarks, recorded_by)
                VALUES (?, ?, ?, ?, ?, ?)
            ");

            foreach ($data['records'] as $rec) {
                $stmt->execute([
                    $data['offering_id'],
                    $rec['student_id'],
                    $data['class_date'],
                    $rec['status'],
                    $rec['remarks'] ?? null,
                    $user['id']
                ]);
            }

            Database::commit();
            Response::success(null, 'Attendance recorded successfully');
        } catch (\Throwable $e) {
            Database::rollBack();
            Response::error($e->getMessage(), 400);
        }
    }

    // PARENT PORTAL ENDPOINTS
    public function parentWards(Request $request): void {
        $user = $request->getUser();
        $stmt = $this->db->prepare("
            SELECT u.id, u.first_name, u.last_name, u.email, u.phone, psm.relationship
            FROM parent_student_map psm
            JOIN users u ON psm.student_id = u.id
            WHERE psm.parent_id = ?
        ");
        $stmt->execute([$user['id']]);
        Response::success($stmt->fetchAll());
    }

    public function wardOverview(Request $request, array $params): void {
        $studentId = (int)$params['studentId'];

        // Get enrollments
        $eStmt = $this->db->prepare("
            SELECT e.*, co.title as offering_title, c.title as course_title, co.delivery_mode, inv.status as invoice_status, inv.amount
            FROM enrollments e
            JOIN course_offerings co ON e.offering_id = co.id
            JOIN courses c ON co.course_id = c.id
            LEFT JOIN invoices inv ON inv.student_id = e.student_id AND inv.offering_id = e.offering_id
            WHERE e.student_id = ?
        ");
        $eStmt->execute([$studentId]);
        $enrollments = $eStmt->fetchAll();

        // Get Attendance
        $aStmt = $this->db->prepare("
            SELECT ar.*, co.title as offering_title
            FROM attendance_records ar
            JOIN course_offerings co ON ar.offering_id = co.id
            WHERE ar.student_id = ?
            ORDER BY ar.class_date DESC
        ");
        $aStmt->execute([$studentId]);
        $attendance = $aStmt->fetchAll();

        // Get Quiz Attempts
        $qStmt = $this->db->prepare("
            SELECT qa.*, q.title as quiz_title
            FROM quiz_attempts qa
            JOIN quizzes q ON qa.quiz_id = q.id
            WHERE qa.student_id = ?
        ");
        $qStmt->execute([$studentId]);
        $quizzes = $qStmt->fetchAll();

        Response::success([
            'student_id' => $studentId,
            'enrollments' => $enrollments,
            'attendance' => $attendance,
            'quizzes' => $quizzes
        ]);
    }

    // ADMIN DASHBOARD STATS
    public function adminStats(Request $request): void {
        $totalStudents = (int)$this->db->query("SELECT COUNT(*) FROM user_roles WHERE role_id = 4")->fetchColumn();
        $totalTeachers = (int)$this->db->query("SELECT COUNT(*) FROM user_roles WHERE role_id = 3")->fetchColumn();
        $totalCourses = (int)$this->db->query("SELECT COUNT(*) FROM courses")->fetchColumn();
        $totalOfferings = (int)$this->db->query("SELECT COUNT(*) FROM course_offerings")->fetchColumn();
        $activeEnrollments = (int)$this->db->query("SELECT COUNT(*) FROM enrollments WHERE status = 'ACTIVE'")->fetchColumn();
        $totalRevenue = (float)$this->db->query("SELECT SUM(amount) FROM payments WHERE status = 'SUCCESS'")->fetchColumn();

        Response::success([
            'total_students' => $totalStudents,
            'total_teachers' => $totalTeachers,
            'total_courses' => $totalCourses,
            'total_offerings' => $totalOfferings,
            'active_enrollments' => $activeEnrollments,
            'total_revenue' => $totalRevenue
        ]);
    }
}

<?php

namespace App\Repositories;

use App\Core\Database;

class CourseRepository {
    private \PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function getAllCourses(): array {
        $stmt = $this->db->query("SELECT * FROM courses ORDER BY id DESC");
        return $stmt->fetchAll();
    }

    public function getCourseById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT * FROM courses WHERE id = ?");
        $stmt->execute([$id]);
        $course = $stmt->fetch();
        if (!$course) return null;

        // Modules & Lessons
        $course['modules'] = $this->getCourseModules($id);
        return $course;
    }

    public function createCourse(array $data): array {
        $stmt = $this->db->prepare("
            INSERT INTO courses (title, code, category, description, thumbnail_url, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['title'],
            $data['code'],
            $data['category'],
            $data['description'] ?? null,
            $data['thumbnail_url'] ?? null,
            $data['status'] ?? 'PUBLISHED'
        ]);

        return $this->getCourseById((int)$this->db->lastInsertId());
    }

    public function getAllOfferings(?string $deliveryMode = null): array {
        $sql = "
            SELECT co.*,
                   c.title as course_title, c.code as course_code, c.category as course_category, c.thumbnail_url,
                   loc.name as location_name, loc.address as location_address, loc.city as location_city,
                   cr.room_number as classroom_name,
                   u.first_name as instructor_first_name, u.last_name as instructor_last_name
            FROM course_offerings co
            JOIN courses c ON co.course_id = c.id
            LEFT JOIN locations loc ON co.location_id = loc.id
            LEFT JOIN classrooms cr ON co.classroom_id = cr.id
            LEFT JOIN users u ON co.instructor_id = u.id
            WHERE co.status != 'CANCELLED'
        ";

        if ($deliveryMode) {
            $sql .= " AND co.delivery_mode = " . $this->db->quote($deliveryMode);
        }

        $sql .= " ORDER BY co.id DESC";

        $stmt = $this->db->query($sql);
        return $stmt->fetchAll();
    }

    public function getOfferingById(int $id): ?array {
        $stmt = $this->db->prepare("
            SELECT co.*,
                   c.title as course_title, c.code as course_code, c.category as course_category, c.description as course_description, c.thumbnail_url,
                   loc.name as location_name, loc.address as location_address, loc.city as location_city, loc.country as location_country,
                   cr.room_number as classroom_name, cr.capacity as classroom_capacity,
                   u.first_name as instructor_first_name, u.last_name as instructor_last_name, u.email as instructor_email
            FROM course_offerings co
            JOIN courses c ON co.course_id = c.id
            LEFT JOIN locations loc ON co.location_id = loc.id
            LEFT JOIN classrooms cr ON co.classroom_id = cr.id
            LEFT JOIN users u ON co.instructor_id = u.id
            WHERE co.id = ?
        ");
        $stmt->execute([$id]);
        $offering = $stmt->fetch();
        if (!$offering) return null;

        $offering['modules'] = $this->getCourseModules($offering['course_id']);
        return $offering;
    }

    public function createOffering(array $data): array {
        $stmt = $this->db->prepare("
            INSERT INTO course_offerings
            (course_id, delivery_mode, location_id, classroom_id, instructor_id, title, capacity, enrolled_count, price, start_date, end_date, schedule_description, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, 'OPEN')
        ");
        $stmt->execute([
            $data['course_id'],
            $data['delivery_mode'],
            $data['location_id'] ?? null,
            $data['classroom_id'] ?? null,
            $data['instructor_id'] ?? null,
            $data['title'],
            $data['capacity'] ?? 30,
            $data['price'] ?? 0.00,
            $data['start_date'] ?? null,
            $data['end_date'] ?? null,
            $data['schedule_description'] ?? null
        ]);

        return $this->getOfferingById((int)$this->db->lastInsertId());
    }

    public function getCourseModules(int $courseId): array {
        $stmt = $this->db->prepare("
            SELECT * FROM course_modules WHERE course_id = ? ORDER BY sort_order ASC, id ASC
        ");
        $stmt->execute([$courseId]);
        $modules = $stmt->fetchAll();

        foreach ($modules as &$mod) {
            $mod['lessons'] = $this->getModuleLessons($mod['id']);
        }

        return $modules;
    }

    public function getModuleLessons(int $moduleId): array {
        $stmt = $this->db->prepare("
            SELECT * FROM lessons WHERE module_id = ? ORDER BY sort_order ASC, id ASC
        ");
        $stmt->execute([$moduleId]);
        $lessons = $stmt->fetchAll();

        foreach ($lessons as &$les) {
            if ($les['content_type'] === 'QUIZ') {
                $qStmt = $this->db->prepare("SELECT * FROM quizzes WHERE lesson_id = ?");
                $qStmt->execute([$les['id']]);
                $quiz = $qStmt->fetch();
                if ($quiz) {
                    $questStmt = $this->db->prepare("SELECT id, question_text, question_type, options_json FROM quiz_questions WHERE quiz_id = ?");
                    $questStmt->execute([$quiz['id']]);
                    $quiz['questions'] = $questStmt->fetchAll();
                    $les['quiz'] = $quiz;
                }
            } elseif ($les['content_type'] === 'ASSIGNMENT') {
                $aStmt = $this->db->prepare("SELECT * FROM assignments WHERE lesson_id = ?");
                $aStmt->execute([$les['id']]);
                $les['assignment'] = $aStmt->fetch();
            }
        }

        return $lessons;
    }

    public function getAllLocations(): array {
        $stmt = $this->db->query("
            SELECT l.*,
                   (SELECT COUNT(*) FROM classrooms c WHERE c.location_id = l.id) as classroom_count
            FROM locations l
        ");
        return $stmt->fetchAll();
    }

    public function getClassroomsByLocation(int $locationId): array {
        $stmt = $this->db->prepare("SELECT * FROM classrooms WHERE location_id = ?");
        $stmt->execute([$locationId]);
        return $stmt->fetchAll();
    }
}

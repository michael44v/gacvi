<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Core\Database;

class LmsController {
    private \PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function submitQuiz(Request $request): void {
        $user = $request->getUser();
        $data = $request->getBody();

        $quizId = (int)($data['quiz_id'] ?? 0);
        $answers = $data['answers'] ?? []; // map of question_id => answer string

        if (!$quizId || empty($answers)) {
            Response::error('Quiz ID and answers required', 400);
        }

        // Fetch questions
        $stmt = $this->db->prepare("SELECT id, correct_answer FROM quiz_questions WHERE quiz_id = ?");
        $stmt->execute([$quizId]);
        $questions = $stmt->fetchAll();

        if (empty($questions)) {
            Response::error('Quiz has no questions', 400);
        }

        $correctCount = 0;
        foreach ($questions as $q) {
            $qId = $q['id'];
            if (isset($answers[$qId]) && trim(strtolower($answers[$qId])) === trim(strtolower($q['correct_answer']))) {
                $correctCount++;
            }
        }

        $score = round(($correctCount / count($questions)) * 100, 2);

        // Fetch passing score
        $qInfoStmt = $this->db->prepare("SELECT passing_score FROM quizzes WHERE id = ?");
        $qInfoStmt->execute([$quizId]);
        $passingScore = (int)$qInfoStmt->fetchColumn();

        $passed = $score >= $passingScore ? 1 : 0;

        // Record attempt
        $insStmt = $this->db->prepare("
            INSERT INTO quiz_attempts (quiz_id, student_id, score, passed, started_at, completed_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ");
        $insStmt->execute([$quizId, $user['id'], $score, $passed]);

        Response::success([
            'score' => $score,
            'passed' => (bool)$passed,
            'passing_score' => $passingScore,
            'correct_count' => $correctCount,
            'total_questions' => count($questions)
        ], 'Quiz submitted successfully');
    }

    public function submitAssignment(Request $request): void {
        $user = $request->getUser();
        $data = $request->getBody();

        $assignmentId = (int)($data['assignment_id'] ?? 0);
        $submissionText = trim($data['submission_text'] ?? '');
        $fileUrl = trim($data['file_url'] ?? '');

        if (!$assignmentId || (empty($submissionText) && empty($fileUrl))) {
            Response::error('Assignment ID and submission content or file URL required', 400);
        }

        $stmt = $this->db->prepare("
            INSERT INTO assignment_submissions (assignment_id, student_id, file_url, submission_text, status, submitted_at)
            VALUES (?, ?, ?, ?, 'SUBMITTED', CURRENT_TIMESTAMP)
        ");
        $stmt->execute([$assignmentId, $user['id'], $fileUrl, $submissionText]);

        Response::success(null, 'Assignment submitted successfully', 201);
    }
}

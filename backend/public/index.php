<?php

use App\Core\Router;
use App\Core\Request;
use App\Controllers\AuthController;
use App\Controllers\CourseController;
use App\Controllers\EnrollmentController;
use App\Controllers\PortalController;
use App\Controllers\LmsController;
use App\Middleware\AuthMiddleware;
use App\Middleware\RoleMiddleware;

$router = new Router();

// Public Routes
$router->post('/api/v1/auth/login', [AuthController::class, 'login']);
$router->post('/api/v1/auth/register', [AuthController::class, 'register']);

$router->get('/api/v1/courses', [CourseController::class, 'index']);
$router->get('/api/v1/courses/{id}', [CourseController::class, 'show']);
$router->get('/api/v1/offerings', [CourseController::class, 'indexOfferings']);
$router->get('/api/v1/offerings/{id}', [CourseController::class, 'showOffering']);
$router->get('/api/v1/locations', [CourseController::class, 'indexLocations']);
$router->get('/api/v1/locations/{locationId}/classrooms', [CourseController::class, 'indexClassrooms']);

$router->post('/api/v1/payments/webhook', [EnrollmentController::class, 'handleStripeWebhook']);

// Authenticated Routes
$auth = new AuthMiddleware();

$router->get('/api/v1/auth/me', [AuthController::class, 'me'], [$auth]);

// Student / Enrollment Routes
$router->post('/api/v1/enrollments', [EnrollmentController::class, 'enroll'], [$auth]);
$router->post('/api/v1/enrollments/confirm-payment', [EnrollmentController::class, 'confirmPayment'], [$auth]);
$router->get('/api/v1/student/enrollments', [EnrollmentController::class, 'myEnrollments'], [$auth]);

// LMS Routes
$router->post('/api/v1/lms/quiz/submit', [LmsController::class, 'submitQuiz'], [$auth]);
$router->post('/api/v1/lms/assignment/submit', [LmsController::class, 'submitAssignment'], [$auth]);

// Teacher Routes
$router->get('/api/v1/teacher/offerings', [PortalController::class, 'teacherOfferings'], [$auth, RoleMiddleware::has('TEACHER', 'ADMIN', 'SUPER_ADMIN')]);
$router->get('/api/v1/teacher/offerings/{id}/students', [PortalController::class, 'offeringStudents'], [$auth, RoleMiddleware::has('TEACHER', 'ADMIN', 'SUPER_ADMIN')]);
$router->post('/api/v1/teacher/attendance', [PortalController::class, 'recordAttendance'], [$auth, RoleMiddleware::has('TEACHER', 'ADMIN', 'SUPER_ADMIN')]);

// Parent Routes
$router->get('/api/v1/parent/wards', [PortalController::class, 'parentWards'], [$auth, RoleMiddleware::has('PARENT', 'ADMIN', 'SUPER_ADMIN')]);
$router->get('/api/v1/parent/wards/{studentId}', [PortalController::class, 'wardOverview'], [$auth, RoleMiddleware::has('PARENT', 'ADMIN', 'SUPER_ADMIN')]);

// Admin Routes
$router->get('/api/v1/admin/stats', [PortalController::class, 'adminStats'], [$auth, RoleMiddleware::has('ADMIN', 'SUPER_ADMIN')]);
$router->post('/api/v1/admin/courses', [CourseController::class, 'create'], [$auth, RoleMiddleware::has('ADMIN', 'SUPER_ADMIN')]);
$router->post('/api/v1/admin/offerings', [CourseController::class, 'createOffering'], [$auth, RoleMiddleware::has('ADMIN', 'SUPER_ADMIN')]);

// Dispatch Request
$request = new Request();
$router->dispatch($request);

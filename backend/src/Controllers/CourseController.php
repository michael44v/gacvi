<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Repositories\CourseRepository;

class CourseController {
    private CourseRepository $courseRepo;

    public function __construct() {
        $this->courseRepo = new CourseRepository();
    }

    public function index(Request $request): void {
        $courses = $this->courseRepo->getAllCourses();
        Response::success($courses);
    }

    public function show(Request $request, array $params): void {
        $id = (int)$params['id'];
        $course = $this->courseRepo->getCourseById($id);

        if (!$course) {
            Response::error('Course not found', 404);
        }

        Response::success($course);
    }

    public function create(Request $request): void {
        $data = $request->getBody();

        if (empty($data['title']) || empty($data['code']) || empty($data['category'])) {
            Response::error('Title, code, and category are required', 400);
        }

        $course = $this->courseRepo->createCourse($data);
        Response::success($course, 'Course created successfully', 201);
    }

    public function indexOfferings(Request $request): void {
        $mode = $request->getQuery('mode'); // ONLINE or PHYSICAL
        $offerings = $this->courseRepo->getAllOfferings($mode);
        Response::success($offerings);
    }

    public function showOffering(Request $request, array $params): void {
        $id = (int)$params['id'];
        $offering = $this->courseRepo->getOfferingById($id);

        if (!$offering) {
            Response::error('Course offering not found', 404);
        }

        Response::success($offering);
    }

    public function createOffering(Request $request): void {
        $data = $request->getBody();

        if (empty($data['course_id']) || empty($data['delivery_mode']) || empty($data['title'])) {
            Response::error('Course ID, delivery mode, and offering title are required', 400);
        }

        $offering = $this->courseRepo->createOffering($data);
        Response::success($offering, 'Course offering created successfully', 201);
    }

    public function indexLocations(Request $request): void {
        $locations = $this->courseRepo->getAllLocations();
        Response::success($locations);
    }

    public function indexClassrooms(Request $request, array $params): void {
        $locationId = (int)$params['locationId'];
        $classrooms = $this->courseRepo->getClassroomsByLocation($locationId);
        Response::success($classrooms);
    }
}

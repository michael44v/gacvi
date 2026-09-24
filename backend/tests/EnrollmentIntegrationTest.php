<?php

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Core\Database;
use App\Database\Schema;
use App\Repositories\CourseRepository;
use App\Repositories\EnrollmentRepository;

class EnrollmentIntegrationTest extends TestCase {
    public static function setUpBeforeClass(): void {
        $_ENV['DB_DRIVER'] = 'sqlite';
        $_ENV['DB_PATH'] = __DIR__ . '/test_gacvi.sqlite';
        if (file_exists($_ENV['DB_PATH'])) {
            unlink($_ENV['DB_PATH']);
        }
        Schema::up();
    }

    public static function tearDownAfterClass(): void {
        if (isset($_ENV['DB_PATH']) && file_exists($_ENV['DB_PATH'])) {
            unlink($_ENV['DB_PATH']);
        }
    }

    public function testCourseOfferingsAndEnrollmentFlow(): void {
        $courseRepo = new CourseRepository();
        $offerings = $courseRepo->getAllOfferings();
        $this->assertNotEmpty($offerings);

        $offering = $offerings[0];
        $this->assertArrayHasKey('id', $offering);

        $enrollmentRepo = new EnrollmentRepository();
        $result = $enrollmentRepo->createEnrollmentWithInvoice(3, $offering['id'], (float)$offering['price']);

        $this->assertArrayHasKey('enrollment_id', $result);
        $this->assertArrayHasKey('invoice_id', $result);

        $activated = $enrollmentRepo->activateEnrollmentByInvoice(
            $result['invoice_id'],
            'TRX-TEST-123',
            'pi_test_stripe_999'
        );

        $this->assertTrue($activated);

        $studentEnrollments = $enrollmentRepo->getStudentEnrollments(3);
        $this->assertNotEmpty($studentEnrollments);
    }
}

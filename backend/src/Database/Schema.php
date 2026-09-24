<?php

namespace App\Database;

use App\Core\Database;

class Schema {
    public static function up(): void {
        $pdo = Database::getConnection();
        $driver = $pdo->getAttribute(\PDO::ATTR_DRIVER_NAME);

        $pdo->beginTransaction();

        try {
            if ($driver === 'sqlite') {
                self::sqliteSchema($pdo);
            } else {
                self::mysqlSchema($pdo);
            }

            self::seedInitialData($pdo);

            $pdo->commit();
            echo "Database migrations executed successfully.\n";
        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    private static function sqliteSchema(\PDO $pdo): void {
        $queries = [
            "CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                phone TEXT,
                status TEXT DEFAULT 'ACTIVE',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );",

            "CREATE TABLE IF NOT EXISTS roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                description TEXT
            );",

            "CREATE TABLE IF NOT EXISTS user_roles (
                user_id INTEGER NOT NULL,
                role_id INTEGER NOT NULL,
                PRIMARY KEY (user_id, role_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
            );",

            "CREATE TABLE IF NOT EXISTS locations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                address TEXT NOT NULL,
                city TEXT NOT NULL,
                state TEXT,
                country TEXT NOT NULL,
                status TEXT DEFAULT 'ACTIVE',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );",

            "CREATE TABLE IF NOT EXISTS classrooms (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                location_id INTEGER NOT NULL,
                room_number TEXT NOT NULL,
                capacity INTEGER NOT NULL DEFAULT 30,
                facilities TEXT,
                status TEXT DEFAULT 'ACTIVE',
                FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
            );",

            "CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                code TEXT UNIQUE NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                thumbnail_url TEXT,
                status TEXT DEFAULT 'PUBLISHED',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );",

            "CREATE TABLE IF NOT EXISTS course_offerings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_id INTEGER NOT NULL,
                delivery_mode TEXT NOT NULL CHECK(delivery_mode IN ('ONLINE', 'PHYSICAL')),
                location_id INTEGER,
                classroom_id INTEGER,
                instructor_id INTEGER,
                title TEXT NOT NULL,
                capacity INTEGER NOT NULL DEFAULT 30,
                enrolled_count INTEGER NOT NULL DEFAULT 0,
                price REAL NOT NULL DEFAULT 0.00,
                start_date DATE,
                end_date DATE,
                schedule_description TEXT,
                status TEXT DEFAULT 'OPEN',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
                FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL,
                FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
            );",

            "CREATE TABLE IF NOT EXISTS course_modules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                sort_order INTEGER DEFAULT 1,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            );",

            "CREATE TABLE IF NOT EXISTS lessons (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                module_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                content_type TEXT NOT NULL CHECK(content_type IN ('VIDEO', 'TEXT', 'PDF', 'ASSIGNMENT', 'QUIZ')),
                content_body TEXT,
                file_url TEXT,
                video_url TEXT,
                is_preview INTEGER DEFAULT 0,
                sort_order INTEGER DEFAULT 1,
                FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
            );",

            "CREATE TABLE IF NOT EXISTS enrollments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id INTEGER NOT NULL,
                offering_id INTEGER NOT NULL,
                status TEXT DEFAULT 'PENDING_PAYMENT',
                enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME,
                UNIQUE(student_id, offering_id),
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE
            );",

            "CREATE TABLE IF NOT EXISTS invoices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_number TEXT UNIQUE NOT NULL,
                student_id INTEGER NOT NULL,
                offering_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                currency TEXT DEFAULT 'USD',
                status TEXT DEFAULT 'UNPAID',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE
            );",

            "CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invoice_id INTEGER NOT NULL,
                transaction_ref TEXT UNIQUE NOT NULL,
                stripe_payment_intent_id TEXT,
                amount REAL NOT NULL,
                payment_method TEXT DEFAULT 'STRIPE',
                status TEXT DEFAULT 'PENDING',
                paid_at DATETIME,
                FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
            );",

            "CREATE TABLE IF NOT EXISTS assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lesson_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                instructions TEXT NOT NULL,
                max_score INTEGER DEFAULT 100,
                due_date DATETIME,
                FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
            );",

            "CREATE TABLE IF NOT EXISTS assignment_submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                assignment_id INTEGER NOT NULL,
                student_id INTEGER NOT NULL,
                file_url TEXT,
                submission_text TEXT,
                score REAL,
                feedback TEXT,
                status TEXT DEFAULT 'SUBMITTED',
                submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                graded_at DATETIME,
                FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            );",

            "CREATE TABLE IF NOT EXISTS quizzes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                lesson_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                time_limit_minutes INTEGER DEFAULT 30,
                passing_score INTEGER DEFAULT 70,
                FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
            );",

            "CREATE TABLE IF NOT EXISTS quiz_questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                quiz_id INTEGER NOT NULL,
                question_text TEXT NOT NULL,
                question_type TEXT DEFAULT 'MULTIPLE_CHOICE',
                options_json TEXT NOT NULL,
                correct_answer TEXT NOT NULL,
                FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
            );",

            "CREATE TABLE IF NOT EXISTS quiz_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                quiz_id INTEGER NOT NULL,
                student_id INTEGER NOT NULL,
                score REAL DEFAULT 0.0,
                passed INTEGER DEFAULT 0,
                started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME,
                FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            );",

            "CREATE TABLE IF NOT EXISTS attendance_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                offering_id INTEGER NOT NULL,
                student_id INTEGER NOT NULL,
                class_date DATE NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
                remarks TEXT,
                recorded_by INTEGER NOT NULL,
                FOREIGN KEY (offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE
            );",

            "CREATE TABLE IF NOT EXISTS parent_student_map (
                parent_id INTEGER NOT NULL,
                student_id INTEGER NOT NULL,
                relationship TEXT DEFAULT 'GUARDIAN',
                PRIMARY KEY (parent_id, student_id),
                FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            );",

            "CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                actor_id INTEGER,
                action TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id INTEGER,
                details_json TEXT,
                ip_address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );"
        ];

        foreach ($queries as $q) {
            $pdo->exec($q);
        }
    }

    private static function mysqlSchema(\PDO $pdo): void {
        // Equivalent MySQL statements with InnoDB and utf8mb4
        $queries = [
            "CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                phone VARCHAR(30),
                status VARCHAR(20) DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                description VARCHAR(255)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS user_roles (
                user_id INT NOT NULL,
                role_id INT NOT NULL,
                PRIMARY KEY (user_id, role_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS locations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                address TEXT NOT NULL,
                city VARCHAR(100) NOT NULL,
                state VARCHAR(100),
                country VARCHAR(100) NOT NULL,
                status VARCHAR(20) DEFAULT 'ACTIVE',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS classrooms (
                id INT AUTO_INCREMENT PRIMARY KEY,
                location_id INT NOT NULL,
                room_number VARCHAR(50) NOT NULL,
                capacity INT NOT NULL DEFAULT 30,
                facilities TEXT,
                status VARCHAR(20) DEFAULT 'ACTIVE',
                FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS courses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                code VARCHAR(50) NOT NULL UNIQUE,
                category VARCHAR(100) NOT NULL,
                description TEXT,
                thumbnail_url VARCHAR(255),
                status VARCHAR(20) DEFAULT 'PUBLISHED',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS course_offerings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_id INT NOT NULL,
                delivery_mode ENUM('ONLINE', 'PHYSICAL') NOT NULL,
                location_id INT NULL,
                classroom_id INT NULL,
                instructor_id INT NULL,
                title VARCHAR(200) NOT NULL,
                capacity INT NOT NULL DEFAULT 30,
                enrolled_count INT NOT NULL DEFAULT 0,
                price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                start_date DATE,
                end_date DATE,
                schedule_description TEXT,
                status VARCHAR(20) DEFAULT 'OPEN',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
                FOREIGN KEY (classroom_id) REFERENCES classrooms(id) ON DELETE SET NULL,
                FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS course_modules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                course_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                sort_order INT DEFAULT 1,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS lessons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                module_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                content_type ENUM('VIDEO', 'TEXT', 'PDF', 'ASSIGNMENT', 'QUIZ') NOT NULL,
                content_body LONGTEXT,
                file_url VARCHAR(255),
                video_url VARCHAR(255),
                is_preview TINYINT(1) DEFAULT 0,
                sort_order INT DEFAULT 1,
                FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS enrollments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id INT NOT NULL,
                offering_id INT NOT NULL,
                status VARCHAR(30) DEFAULT 'PENDING_PAYMENT',
                enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NULL,
                UNIQUE KEY unique_student_offering (student_id, offering_id),
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS invoices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_number VARCHAR(50) NOT NULL UNIQUE,
                student_id INT NOT NULL,
                offering_id INT NOT NULL,
                amount DECIMAL(10,2) NOT NULL,
                currency VARCHAR(10) DEFAULT 'USD',
                status VARCHAR(20) DEFAULT 'UNPAID',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_id INT NOT NULL,
                transaction_ref VARCHAR(100) NOT NULL UNIQUE,
                stripe_payment_intent_id VARCHAR(100),
                amount DECIMAL(10,2) NOT NULL,
                payment_method VARCHAR(50) DEFAULT 'STRIPE',
                status VARCHAR(20) DEFAULT 'PENDING',
                paid_at TIMESTAMP NULL,
                FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS assignments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lesson_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                instructions TEXT NOT NULL,
                max_score INT DEFAULT 100,
                due_date TIMESTAMP NULL,
                FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS assignment_submissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                assignment_id INT NOT NULL,
                student_id INT NOT NULL,
                file_url VARCHAR(255),
                submission_text TEXT,
                score DECIMAL(5,2),
                feedback TEXT,
                status VARCHAR(20) DEFAULT 'SUBMITTED',
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                graded_at TIMESTAMP NULL,
                FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS quizzes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lesson_id INT NOT NULL,
                title VARCHAR(200) NOT NULL,
                time_limit_minutes INT DEFAULT 30,
                passing_score INT DEFAULT 70,
                FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS quiz_questions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                quiz_id INT NOT NULL,
                question_text TEXT NOT NULL,
                question_type VARCHAR(50) DEFAULT 'MULTIPLE_CHOICE',
                options_json LONGTEXT NOT NULL,
                correct_answer VARCHAR(255) NOT NULL,
                FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS quiz_attempts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                quiz_id INT NOT NULL,
                student_id INT NOT NULL,
                score DECIMAL(5,2) DEFAULT 0.0,
                passed TINYINT(1) DEFAULT 0,
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP NULL,
                FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS attendance_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                offering_id INT NOT NULL,
                student_id INT NOT NULL,
                class_date DATE NOT NULL,
                status ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED') NOT NULL,
                remarks TEXT,
                recorded_by INT NOT NULL,
                FOREIGN KEY (offering_id) REFERENCES course_offerings(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS parent_student_map (
                parent_id INT NOT NULL,
                student_id INT NOT NULL,
                relationship VARCHAR(50) DEFAULT 'GUARDIAN',
                PRIMARY KEY (parent_id, student_id),
                FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",

            "CREATE TABLE IF NOT EXISTS audit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                actor_id INT,
                action VARCHAR(100) NOT NULL,
                entity_type VARCHAR(100) NOT NULL,
                entity_id INT,
                details_json LONGTEXT,
                ip_address VARCHAR(45),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
        ];

        foreach ($queries as $q) {
            $pdo->exec($q);
        }
    }

    private static function seedInitialData(\PDO $pdo): void {
        // Seed roles
        $stmt = $pdo->prepare("INSERT OR IGNORE INTO roles (id, name, description) VALUES (?, ?, ?)");
        // Handles both SQLite and MySQL if IGNORE syntax is standard or via try/catch
        $roles = [
            [1, 'SUPER_ADMIN', 'Super Administrator with full access'],
            [2, 'ADMIN', 'Institutional Administrator'],
            [3, 'TEACHER', 'Course Instructor'],
            [4, 'STUDENT', 'Enrolled Student'],
            [5, 'PARENT', 'Parent or Guardian']
        ];

        foreach ($roles as $r) {
            try {
                $stmt->execute($r);
            } catch (\Exception $e) {
                // Ignore duplicate
            }
        }

        // Seed Super Admin User if empty
        $count = (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        if ($count === 0) {
            $passHash = password_hash('Admin123!', PASSWORD_BCRYPT);

            // Seed Admin
            $pdo->exec("INSERT INTO users (id, first_name, last_name, email, password_hash, phone, status) VALUES
                (1, 'System', 'Admin', 'admin@gacvi.org', '{$passHash}', '+1-800-555-0199', 'ACTIVE'),
                (2, 'Dr. Sarah', 'Jenkins', 'teacher@gacvi.org', '{$passHash}', '+1-800-555-0100', 'ACTIVE'),
                (3, 'Alex', 'Morgan', 'student@gacvi.org', '{$passHash}', '+1-800-555-0200', 'ACTIVE'),
                (4, 'Robert', 'Morgan', 'parent@gacvi.org', '{$passHash}', '+1-800-555-0300', 'ACTIVE')
            ");

            // User roles
            $pdo->exec("INSERT INTO user_roles (user_id, role_id) VALUES
                (1, 1), (2, 3), (3, 4), (4, 5)
            ");

            // Parent student link
            $pdo->exec("INSERT INTO parent_student_map (parent_id, student_id, relationship) VALUES (4, 3, 'FATHER')");

            // Seed Locations & Classrooms
            $pdo->exec("INSERT INTO locations (id, name, address, city, state, country) VALUES
                (1, 'GACVI Main Campus', '100 Vocational Way, Suite 200', 'Toronto', 'Ontario', 'Canada'),
                (2, 'GACVI Health Innovation Hub', '45 Healthcare Boulevard', 'Lagos', 'Lagos State', 'Nigeria')
            ");

            $pdo->exec("INSERT INTO classrooms (id, location_id, room_number, capacity, facilities) VALUES
                (1, 1, 'Lab 101 - Clinical Skills Room', 25, 'Hospital Beds, Manikins, Phlebotomy Kits, Smart Screen'),
                (2, 2, 'Room 204 - Vocational Lecture Hall', 40, 'Projector, AC, High-Speed WiFi, Audio System')
            ");

            // Seed Courses
            $pdo->exec("INSERT INTO courses (id, title, code, category, description, thumbnail_url, status) VALUES
                (1, 'Healthcare Assistant & Personal Support Specialist', 'HCA-101', 'Healthcare', 'Comprehensive training for clinical support, personal care, patient safety, and medical terminology.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600', 'PUBLISHED'),
                (2, 'Phlebotomy & Laboratory Clinical Procedures', 'PLB-201', 'Medical Diagnostics', 'Hands-on training in blood collection techniques, specimen handling, safety protocols, and lab equipment.', 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600', 'PUBLISHED'),
                (3, 'Emergency First Aid & CPR Certification', 'EFA-100', 'Emergency Care', 'Essential life-saving techniques, AED operation, trauma care, and emergency response protocols.', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600', 'PUBLISHED')
            ");

            // Seed Course Offerings
            $pdo->exec("INSERT INTO course_offerings (id, course_id, delivery_mode, location_id, classroom_id, instructor_id, title, capacity, enrolled_count, price, start_date, end_date, schedule_description, status) VALUES
                (1, 1, 'PHYSICAL', 1, 1, 2, 'Healthcare Assistant - Toronto Main Campus Cohort A', 25, 1, 1250.00, '2026-10-01', '2026-12-15', 'Saturdays 9:00 AM - 1:00 PM EST', 'OPEN'),
                (2, 1, 'ONLINE', NULL, NULL, 2, 'Healthcare Assistant - Online Self-Paced Cohort', 100, 0, 850.00, '2026-10-01', '2027-04-01', 'Flexible Online Access with Weekly Live Q&A', 'OPEN'),
                (3, 2, 'PHYSICAL', 2, 2, 2, 'Phlebotomy Certification - Lagos Hub Weekend Class', 30, 0, 950.00, '2026-10-15', '2026-11-30', 'Saturdays & Sundays 10:00 AM - 2:00 PM WAT', 'OPEN')
            ");

            // Seed Modules & Lessons
            $pdo->exec("INSERT INTO course_modules (id, course_id, title, description, sort_order) VALUES
                (1, 1, 'Module 1: Foundations of Clinical Care & Ethics', 'Patient dignity, HIPAA/Privacy laws, infection control.', 1),
                (2, 1, 'Module 2: Vital Signs & Patient Monitoring', 'Measuring blood pressure, heart rate, oxygen levels, and documentation.', 2)
            ");

            $pdo->exec("INSERT INTO lessons (id, module_id, title, content_type, content_body, video_url, is_preview, sort_order) VALUES
                (1, 1, 'Introduction to Healthcare Assisting', 'VIDEO', 'Overview of healthcare support role, professional ethics, and safety.', 'https://www.w3schools.com/html/mov_bbb.mp4', 1, 1),
                (2, 1, 'Infection Prevention & PPE Standards', 'TEXT', 'Detailed guidelines on proper hand hygiene, donning and doffing personal protective equipment (PPE).', NULL, 0, 2),
                (3, 2, 'Accurate Measurement of Vital Signs', 'VIDEO', 'Demonstration of blood pressure measurement using sphygmomanometer and stethoscopes.', 'https://www.w3schools.com/html/mov_bbb.mp4', 0, 1)
            ");

            // Seed Quiz & Assignment
            $pdo->exec("INSERT INTO quizzes (id, lesson_id, title, time_limit_minutes, passing_score) VALUES
                (1, 2, 'Infection Control Readiness Quiz', 15, 75)
            ");

            $pdo->exec("INSERT INTO quiz_questions (id, quiz_id, question_text, question_type, options_json, correct_answer) VALUES
                (1, 1, 'What is the minimum duration recommended for washing hands with soap and water?', 'MULTIPLE_CHOICE', '[\"5 seconds\",\"10 seconds\",\"20 seconds\",\"60 seconds\"]', '20 seconds'),
                (2, 1, 'Which item of PPE should always be removed LAST?', 'MULTIPLE_CHOICE', '[\"Gloves\",\"Mask / N95 Respirator\",\"Gown\",\"Goggles\"]', 'Mask / N95 Respirator')
            ");

            $pdo->exec("INSERT INTO assignments (id, lesson_id, title, instructions, max_score, due_date) VALUES
                (1, 3, 'Patient Vital Signs Case Study', 'Read the provided clinical case study and record blood pressure, pulse rate, and oxygenation analysis in a 2-page report.', 100, '2026-11-15 23:59:59')
            ");

            // Seed Enrollment for Alex Morgan (Student ID 3) in Offering 1
            $pdo->exec("INSERT INTO enrollments (id, student_id, offering_id, status, enrolled_at) VALUES
                (1, 3, 1, 'ACTIVE', CURRENT_TIMESTAMP)
            ");

            $pdo->exec("INSERT INTO invoices (id, invoice_number, student_id, offering_id, amount, currency, status) VALUES
                (1, 'INV-2026-0001', 3, 1, 1250.00, 'USD', 'PAID')
            ");

            $pdo->exec("INSERT INTO payments (id, invoice_id, transaction_ref, stripe_payment_intent_id, amount, payment_method, status, paid_at) VALUES
                (1, 1, 'TRX-GACVI-10001', 'pi_mock_stripe_12345', 1250.00, 'STRIPE', 'SUCCESS', CURRENT_TIMESTAMP)
            ");

            // Seed Attendance Record
            $pdo->exec("INSERT INTO attendance_records (id, offering_id, student_id, class_date, status, remarks, recorded_by) VALUES
                (1, 1, 3, '2026-10-03', 'PRESENT', 'On time and fully engaged in practical lab', 2)
            ");
        }
    }
}

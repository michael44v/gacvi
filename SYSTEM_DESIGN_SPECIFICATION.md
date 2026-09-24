# GACVI Academy - System Design Specification
**Giant Ambassadors Canadian Vocational Institute (GACVI)**
*Healthcare Education for Real Impact*

---

## 1. System Overview

GACVI Academy (Giant Ambassadors Canadian Vocational Institute) is a production-grade, enterprise School Management Portal and Learning Management System (LMS) specifically tailored for vocational healthcare education and professional training.

The system supports hybrid educational delivery:
- **Online Courses**: Self-paced or scheduled remote learning with interactive video/text lessons, quizzes, assignments, automated progress tracking, and digital certificates.
- **Physical Courses**: In-person vocational training taking place across designated training centers, physical classrooms, and clinical labs with capacity controls, schedule collision prevention, physical attendance logging, and instructor assignments.

The system is built with a custom lightweight PHP MVC backend architecture and a responsive React + TypeScript frontend adhering to GACVI's brand identity (Deep Navy Blue `#0A2240`, Gold `#D4AF37`, Canadian Red `#C8102E`, and Crisp White `#FFFFFF`).

---

## 2. Actors and Roles

The system uses Role-Based Access Control (RBAC) with granular permission flags:

1. **SUPER_ADMIN / ADMIN**:
   - Manages institutional settings, academic sessions, locations, classrooms, courses, offerings, schedules, teacher assignments, user accounts, fee structures, refunds, audit logs, and system reports.
2. **TEACHER / INSTRUCTOR**:
   - Manages course content (modules, lessons, learning materials), grades assignments and quizzes, records physical class attendance, posts announcements, and communicates with enrolled students in their assigned course offerings.
3. **STUDENT**:
   - Browses available online/physical course offerings, enrolls, completes online payments via Stripe, accesses LMS content, watches video lessons, submits assignments, takes quizzes, views physical class center/schedule info, tracks attendance, and views academic results/certificates.
4. **PARENT / GUARDIAN**:
   - Linked to one or more ward students. Has read-only visibility into academic progress, quiz scores, physical attendance logs, schedule timetables, and invoice/payment receipts. Can pay outstanding fees on behalf of wards.

---

## 3. Functional Requirements

### 3.1 Course vs. Course Offering Architecture
- **Course**: Abstract educational definition (e.g., "Healthcare Assistant Diploma", "Phlebotomy & Clinical Care"). Contains overall syllabus, category, prerequisite rules, modules, and lessons.
- **Course Offering**: Concrete operational delivery instance (e.g., "Healthcare Assistant - Lagos Center - Saturday Morning Cohort A", or "Healthcare Assistant - Online Self-Paced 2026").
- Offerings dictate delivery mode (`ONLINE` vs `PHYSICAL`), location, physical classroom, assigned instructor, start/end dates, class schedule, seat capacity, fee amount, and current operational status.

### 3.2 Enrollment Lifecycle State Machine
Enrollments transition through strict states:
`PENDING_PAYMENT` ➔ `PAYMENT_PROCESSING` ➔ `ACTIVE` ➔ `COMPLETED`
(Alternative transitions: `CANCELLED`, `EXPIRED`, `SUSPENDED`).
- Race condition safeguards prevent double-booking or over-enrolling physical classes beyond seat capacity using database row locking (`FOR UPDATE`) and atomic operations.

### 3.3 Payment Subsystem (Stripe)
- Server-side order/invoice generation.
- Stripe PaymentIntent initialization and server-to-server webhook handling with signature verification.
- Idempotent webhook processing to prevent duplicate activation.
- Receipt generation and transaction auditing.

### 3.4 Physical Class Management
- Location & Classroom hierarchy (`Location` ➔ `Classroom` ➔ `Course Offering`).
- Capacity enforcement, classroom availability checks, and teacher timetable conflict detection.
- QR-code / manual physical class attendance tracking per session.

### 3.5 LMS (Learning Management System)
- Hierarchical structure: `Course` ➔ `Module` ➔ `Lesson` (Video, Document/PDF, Text, Quiz, Assignment).
- Sequential progression tracking persisted server-side.
- Assignment submission and instructor grading workflow.
- Quiz engine supporting multiple question types, automated grading, time limits, and attempt caps.

### 3.6 Parent / Guardian Access
- Linked ward relationship system (`parent_student_map`).
- Dedicated parent portal for tracking student attendance, grades, announcements, and paying pending invoices.

---

## 4. Non-Functional & Security Requirements

1. **Security**:
   - Password hashing using `PASSWORD_ARGON2ID` / `PASSWORD_BCRYPT`.
   - Stateless JWT Authentication with secure token rotation and authorization middleware.
   - Input sanitization and parameterized PDO SQL queries to eliminate SQL Injection.
   - Strict XSS escaping, CORS enforcement, and CSRF header verification for state-changing requests.
2. **Performance & Scalability**:
   - Normalized database schema with foreign key constraints and indexed lookup fields.
   - Fast React frontend with client-side caching and dynamic chunking.
3. **Auditability & Observability**:
   - Centralized `audit_logs` recording actor ID, action name, target entity, IP address, and payload diffs.
   - Structured JSON/text application logs for error tracking without sensitive data exposure.

---

## 5. Domain Model & ERD (Entity Relationship Overview)

```text
[ User ] 1 ─── N [ UserRole ] N ─── 1 [ Role ] 1 ─── N [ Permission ]
   │
   ├── (is Student) ─── 1:N ─── [ Enrollment ] ─── N:1 ─── [ CourseOffering ]
   │                                   │                           │
   │                                   ├── 1:N ── [ Invoice ]      ├── N:1 ── [ Course ]
   │                                   │              │            ├── N:1 ── [ Location ]
   │                                   │        1:N [ Payment ]    └── N:1 ── [ Classroom ]
   │                                   │
   ├── (is Parent) ─── N:M ─── [ Student ]                         ├── 1:N ── [ CourseModule ] ── 1:N ── [ Lesson ]
   │                                                               │                                         │
   └── (is Teacher) ── 1:N ─── [ CourseOffering ]                  │                                         ├── [ Assignment ]
                                                                   │                                         └── [ Quiz ]
                                                                   └── 1:N ── [ AttendanceRecord ]
```

---

## 6. Database Schema Design (MySQL / MariaDB)

Key Tables:
1. `users`: (`id`, `first_name`, `last_name`, `email`, `password_hash`, `phone`, `status`, `created_at`, `updated_at`)
2. `roles`: (`id`, `name`, `slug`, `description`)
3. `user_roles`: (`user_id`, `role_id`)
4. `locations`: (`id`, `name`, `address`, `city`, `state`, `country`, `status`)
5. `classrooms`: (`id`, `location_id`, `room_number`, `capacity`, `facilities`)
6. `courses`: (`id`, `title`, `code`, `category`, `description`, `thumbnail_url`, `status`, `created_at`)
7. `course_offerings`: (`id`, `course_id`, `delivery_mode` [ONLINE/PHYSICAL], `location_id`, `classroom_id`, `instructor_id`, `title`, `capacity`, `enrolled_count`, `price`, `start_date`, `end_date`, `schedule_description`, `status`)
8. `course_modules`: (`id`, `course_id`, `title`, `description`, `sort_order`)
9. `lessons`: (`id`, `module_id`, `title`, `content_type` [VIDEO, TEXT, PDF, ASSIGNMENT, QUIZ], `content_body`, `file_url`, `video_url`, `is_preview`, `sort_order`)
10. `enrollments`: (`id`, `student_id`, `offering_id`, `status` [PENDING_PAYMENT, ACTIVE, COMPLETED, CANCELLED], `enrolled_at`, `expires_at`)
11. `invoices`: (`id`, `invoice_number`, `student_id`, `offering_id`, `amount`, `currency`, `status` [UNPAID, PAID, VOID], `created_at`)
12. `payments`: (`id`, `invoice_id`, `transaction_ref`, `stripe_payment_intent_id`, `amount`, `payment_method`, `status` [PENDING, SUCCESS, FAILED], `paid_at`)
13. `assignments`: (`id`, `lesson_id`, `title`, `instructions`, `max_score`, `due_date`)
14. `assignment_submissions`: (`id`, `assignment_id`, `student_id`, `file_url`, `submission_text`, `score`, `feedback`, `status`, `submitted_at`, `graded_at`)
15. `quizzes`: (`id`, `lesson_id`, `title`, `time_limit_minutes`, `passing_score`)
16. `quiz_questions`: (`id`, `quiz_id`, `question_text`, `question_type`, `options_json`, `correct_answer`)
17. `quiz_attempts`: (`id`, `quiz_id`, `student_id`, `score`, `passed`, `started_at`, `completed_at`)
18. `attendance_records`: (`id`, `offering_id`, `student_id`, `class_date`, `status` [PRESENT, ABSENT, LATE, EXCUSED], `remarks`, `recorded_by`)
19. `parent_student_map`: (`parent_id`, `student_id`, `relationship`)
20. `audit_logs`: (`id`, `actor_id`, `action`, `entity_type`, `entity_id`, `details_json`, `ip_address`, `created_at`)

---

## 7. Proposed Directory Structure

```text
/
├── backend/
│   ├── config/              # App & DB configuration
│   ├── src/
│   │   ├── Core/            # Router, Request, Response, Database, JWT, Container
│   │   ├── Controllers/     # Thin HTTP controllers
│   │   ├── Services/        # Business logic layer
│   │   ├── Repositories/    # Data access layer
│   │   ├── Middleware/      # Auth, RBAC, Validation, Error Handling
│   │   ├── Models/ / DTOs/  # Data Transfer Objects & Domain Models
│   │   └── Helpers/         # Logger, Storage, Stripe Client
│   ├── database/
│   │   └── migrations/      # Versioned SQL migration files
│   ├── tests/               # PHPUnit test suites
│   ├── public/              # Front controller index.php
│   └── composer.json
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Nav, Modal, Cards, Table, etc.)
│   │   ├── pages/           # Public Landing, Auth, Student, Teacher, Parent, Admin pages
│   │   ├── services/        # Axios / Fetch API client modules
│   │   ├── context/         # Auth & Theme context
│   │   ├── types/           # TypeScript interfaces
│   │   └── styles/          # Branding CSS (GACVI Navy, Gold, Red theme)
│   ├── package.json
│   └── vite.config.ts
├── SYSTEM_DESIGN_SPECIFICATION.md
└── README.md
```

---

## 8. Workflow Sequence Flows

### 8.1 Student Course Offering Enrollment & Stripe Checkout
```text
Student              Frontend                    PHP Backend                 Stripe API             Database
  │                     │                            │                           │                     │
  ├─ Select Offering ──►│                            │                           │                     │
  │  & Click Enroll     ├─ POST /api/v1/enrollments ─►│                           │                     │
  │                     │                            ├─ Lock Offering Row ───────┼────────────────────►│
  │                     │                            ├─ Check Capacity ──────────┼────────────────────►│
  │                     │                            ├─ Create PENDING Enrollment┼────────────────────►│
  │                     │                            ├─ Create Invoice ──────────┼────────────────────►│
  │                     │                            ├─ Create PaymentIntent ───►│                     │
  │                     │                            │◄─ Return Client Secret ───┤                     │
  │                     │◄─ Return Payment Secret ───┤                           │                     │
  │                     │                            │                           │                     │
  ├─ Submit Card ──────►├─ Confirm Stripe Payment ──────────────────────────────►│                     │
  │                     │                            │                           ├─ Payment Succeeded  │
  │                     │                            │◄─ Webhook: payment_intent ┤                     │
  │                     │                            ├─ Verify Signature         │                     │
  │                     │                            ├─ Begin Transaction ────────────────────────────►│
  │                     │                            ├─ Mark Invoice PAID ────────────────────────────►│
  │                     │                            ├─ Mark Enrollment ACTIVE ───────────────────────►│
  │                     │                            ├─ Increment Enrolled Count ─────────────────────►│
  │                     │                            ├─ Commit Transaction ───────────────────────────►│
  │                     │◄─ Payment Verified ────────┤                           │                     │
```

---

## 9. Next Steps & Approval

Upon approval of this specification, implementation will proceed systematically phase by phase, delivering a robust, production-grade platform for GACVI Academy.

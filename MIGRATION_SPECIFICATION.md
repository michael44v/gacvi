# GACVI Academy - PHP to Node.js / TypeScript Migration Specification

**Giant Ambassadors Canadian Vocational Institute (GACVI)**
*Senior Software Architect Migration Specification Document*

---

## 1. Existing PHP Architecture Overview

The existing backend is implemented in PHP (>= 8.1) using a custom lightweight MVC pattern without full-stack framework dependencies.

- **Routing & Dispatch**: Handled by `App\Core\Router` and `App\Core\Request`. Public front controller in `backend/public/index.php`.
- **Database Access**: Direct PDO statements in `App\Core\Database` with active database drivers for MySQL/MariaDB in production and SQLite for local tests.
- **Controllers**: Thin/medium HTTP controllers (`AuthController`, `CourseController`, `EnrollmentController`, `LmsController`, `PortalController`).
- **Repositories**: Data access classes (`UserRepository`, `CourseRepository`, `EnrollmentRepository`). Some business logic (like transactions and seating checks) is embedded within repositories and controllers.
- **Authentication & Security**: Custom HMAC SHA-256 JWT encoder/decoder (`App\Core\JWT`) and `password_hash` (`PASSWORD_BCRYPT` / `PASSWORD_ARGON2ID`).
- **Authorization**: Middleware-based RBAC (`AuthMiddleware`, `RoleMiddleware`) with roles (`SUPER_ADMIN`, `ADMIN`, `TEACHER`, `STUDENT`, `PARENT`).

---

## 2. Target Node.js Architecture

The new Node.js backend (`backend-node/`) is built on **Node.js + TypeScript + Express + Prisma ORM + PostgreSQL**.

Request Flow:
```text
React + TypeScript (Frontend)
            ↓
    Express / Routes
            ↓
       Controllers
            ↓
        Services
            ↓
Repositories / Data Access
            ↓
       Prisma ORM
            ↓
       PostgreSQL
```

### Layer Responsibilities:
- **Routes (`src/routes`)**: Define HTTP routes, path parameters, and attach middleware (`authMiddleware`, `roleMiddleware`).
- **Controllers (`src/controllers`)**: Parse HTTP requests, extract parameters, validate request payloads, call services, and render standard JSON responses via `ResponseUtil`. Zero business logic or Prisma queries.
- **Services (`src/services`)**: Business logic processing, workflow orchestration, transaction boundaries, and domain rules (e.g. enrollment capacity checks, quiz scoring logic).
- **Repositories (`src/repositories`)**: Encapsulate data access operations using Prisma Client.
- **Prisma (`prisma/schema.prisma`)**: Object-Relational Mapping (ORM) and type generator for PostgreSQL.
- **PostgreSQL**: Production relational database hosted on Aiven or Render.

---

## 3. Migration Inventory

| Module / Component | PHP Location | Responsibility | Database Tables | Target Node.js Location | Migration Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `Controllers/AuthController.php`<br>`Core/JWT.php`<br>`Middleware/AuthMiddleware.php` | Authentication, JWT issuance, profile retrieval | `users`, `roles`, `user_roles` | `backend-node/src/routes/auth.routes.ts` | Completed |
| **Course Management** | `Controllers/CourseController.php`<br>`Repositories/CourseRepository.php` | Courses, offerings, locations, classrooms | `courses`, `course_offerings`, `locations`, `classrooms`, `course_modules`, `lessons` | `backend-node/src/routes/course.routes.ts` | Completed |
| **Enrollment & Payments** | `Controllers/EnrollmentController.php`<br>`Repositories/EnrollmentRepository.php` | Student enrollments, invoices, Stripe payments, webhooks | `enrollments`, `invoices`, `payments` | `backend-node/src/routes/enrollment.routes.ts` | Completed |
| **LMS Engine** | `Controllers/LmsController.php` | Quizzes, auto-grading, assignment submissions | `quizzes`, `quiz_questions`, `quiz_attempts`, `assignments`, `assignment_submissions` | `backend-node/src/routes/lms.routes.ts` | Completed |
| **Teacher Portal** | `Controllers/PortalController.php` | Offering assignments, student rosters, physical attendance | `course_offerings`, `enrollments`, `attendance_records` | `backend-node/src/routes/portal.routes.ts` | Completed |
| **Parent Portal** | `Controllers/PortalController.php` | Linked wards view, student grades & attendance tracking | `parent_student_map`, `enrollments`, `attendance_records`, `quiz_attempts` | `backend-node/src/routes/portal.routes.ts` | Completed |
| **Admin Stats** | `Controllers/PortalController.php` | Institution analytics, total students, active revenue | All major tables | `backend-node/src/routes/portal.routes.ts` | Completed |

---

## 4. PHP-to-Node Responsibility Mapping

| PHP Component | Primary Responsibility | Target Node.js Component | Architecture Mapping Notes |
| :--- | :--- | :--- | :--- |
| `Router.php` / `index.php` | HTTP Routing & Request Dispatching | Express `Router` & `app.ts` | Replaced by Express middleware pipeline |
| `JWT.php` | HMAC SHA-256 JWT Token Generation & Verification | `src/utils/jwt.util.ts` | Uses `jsonwebtoken` package with identical claim signatures |
| `Database.php` | PDO Connection Management | `src/config/prisma.config.ts` | Replaced by Prisma Client instance |
| `AuthMiddleware.php` | Token Verification & User Context injection | `src/middleware/auth.middleware.ts` | Express middleware decoding Bearer header into `req.user` |
| `RoleMiddleware.php` | Role-Based Access Enforcement | `src/middleware/role.middleware.ts` | Middleware factory checking `req.user.roles` with `SUPER_ADMIN` override |
| `AuthController.php` | Auth Request Processing | `AuthRoute` ➔ `AuthController` ➔ `AuthService` ➔ `UserRepository` | Business logic separated into `AuthService` |
| `CourseController.php` & `CourseRepository.php` | Courses & Offerings Data Flow | `CourseRoute` ➔ `CourseController` ➔ `CourseService` ➔ `CourseRepository` | Separated into Service layer |
| `EnrollmentController.php` & `EnrollmentRepository.php` | Enrollment & Stripe Payments | `EnrollmentRoute` ➔ `EnrollmentController` ➔ `EnrollmentService` ➔ `EnrollmentRepository` | Atomic Prisma transactions replace PDO `beginTransaction` |
| `LmsController.php` | Quiz Grading & Submissions | `LmsRoute` ➔ `LmsController` ➔ `LmsService` ➔ `LmsRepository` | Quiz grading logic isolated in `LmsService` |
| `PortalController.php` | Teacher/Parent/Admin Dashboards | `PortalRoute` ➔ `PortalController` ➔ `PortalService` ➔ `PortalRepository` | Aggregated dashboard queries moved to Repository |

---

## 5. Existing Database Schema Analysis

The system contains 20 relational tables:
1. `users`: (`id`, `first_name`, `last_name`, `email`, `password_hash`, `phone`, `status`, `created_at`, `updated_at`)
2. `roles`: (`id`, `name`, `description`)
3. `user_roles`: (`user_id`, `role_id`) - Composite PK `(user_id, role_id)`
4. `locations`: (`id`, `name`, `address`, `city`, `state`, `country`, `status`, `created_at`)
5. `classrooms`: (`id`, `location_id`, `room_number`, `capacity`, `facilities`, `status`)
6. `courses`: (`id`, `title`, `code`, `category`, `description`, `thumbnail_url`, `status`, `created_at`)
7. `course_offerings`: (`id`, `course_id`, `delivery_mode`, `location_id`, `classroom_id`, `instructor_id`, `title`, `capacity`, `enrolled_count`, `price`, `start_date`, `end_date`, `schedule_description`, `status`, `created_at`)
8. `course_modules`: (`id`, `course_id`, `title`, `description`, `sort_order`)
9. `lessons`: (`id`, `module_id`, `title`, `content_type`, `content_body`, `file_url`, `video_url`, `is_preview`, `sort_order`)
10. `enrollments`: (`id`, `student_id`, `offering_id`, `status`, `enrolled_at`, `expires_at`) - Unique `(student_id, offering_id)`
11. `invoices`: (`id`, `invoice_number`, `student_id`, `offering_id`, `amount`, `currency`, `status`, `created_at`) - Unique `invoice_number`
12. `payments`: (`id`, `invoice_id`, `transaction_ref`, `stripe_payment_intent_id`, `amount`, `payment_method`, `status`, `paid_at`) - Unique `transaction_ref`
13. `assignments`: (`id`, `lesson_id`, `title`, `instructions`, `max_score`, `due_date`)
14. `assignment_submissions`: (`id`, `assignment_id`, `student_id`, `file_url`, `submission_text`, `score`, `feedback`, `status`, `submitted_at`, `graded_at`)
15. `quizzes`: (`id`, `lesson_id`, `title`, `time_limit_minutes`, `passing_score`)
16. `quiz_questions`: (`id`, `quiz_id`, `question_text`, `question_type`, `options_json`, `correct_answer`)
17. `quiz_attempts`: (`id`, `quiz_id`, `student_id`, `score`, `passed`, `started_at`, `completed_at`)
18. `attendance_records`: (`id`, `offering_id`, `student_id`, `class_date`, `status`, `remarks`, `recorded_by`)
19. `parent_student_map`: (`parent_id`, `student_id`, `relationship`) - Composite PK `(parent_id, student_id)`
20. `audit_logs`: (`id`, `actor_id`, `action`, `entity_type`, `entity_id`, `details_json`, `ip_address`, `created_at`)

---

## 6. PostgreSQL Migration Plan

- **Schema Engine**: Defined in `prisma/schema.prisma` targeting `postgresql`.
- **Enum Mappings**:
  - `DeliveryMode`: `ONLINE`, `PHYSICAL`
  - `ContentType`: `VIDEO`, `TEXT`, `PDF`, `ASSIGNMENT`, `QUIZ`
  - `AttendanceStatus`: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED`
- **Data Types**:
  - `DECIMAL(10,2)` for prices and monetary amounts.
  - `@default(autoincrement())` for integer primary keys.
  - `@unique` constraints preserved on `email`, `code`, `invoice_number`, `transaction_ref`, and composite keys.
- **Migration Execution**:
  `npx prisma migrate dev --name init` generates versioned SQL migration scripts.

---

## 7. Existing API Inventory

All API endpoints follow RESTful conventions under prefix `/api/v1`:

### Auth Endpoints
- `POST /api/v1/auth/login` (Public)
- `POST /api/v1/auth/register` (Public)
- `GET /api/v1/auth/me` (Authenticated)

### Course & Catalog Endpoints
- `GET /api/v1/courses` (Public)
- `GET /api/v1/courses/:id` (Public)
- `POST /api/v1/admin/courses` (Auth + ADMIN/SUPER_ADMIN)
- `GET /api/v1/offerings` (Public, query filter `?mode=ONLINE|PHYSICAL`)
- `GET /api/v1/offerings/:id` (Public)
- `POST /api/v1/admin/offerings` (Auth + ADMIN/SUPER_ADMIN)
- `GET /api/v1/locations` (Public)
- `GET /api/v1/locations/:locationId/classrooms` (Public)

### Enrollment & Payment Endpoints
- `POST /api/v1/enrollments` (Authenticated Student)
- `POST /api/v1/enrollments/confirm-payment` (Authenticated Student)
- `GET /api/v1/student/enrollments` (Authenticated Student)
- `POST /api/v1/payments/webhook` (Public / Stripe Webhook)

### LMS Endpoints
- `POST /api/v1/lms/quiz/submit` (Authenticated)
- `POST /api/v1/lms/assignment/submit` (Authenticated)

### Portal Endpoints
- `GET /api/v1/teacher/offerings` (Auth + TEACHER/ADMIN/SUPER_ADMIN)
- `GET /api/v1/teacher/offerings/:id/students` (Auth + TEACHER/ADMIN/SUPER_ADMIN)
- `POST /api/v1/teacher/attendance` (Auth + TEACHER/ADMIN/SUPER_ADMIN)
- `GET /api/v1/parent/wards` (Auth + PARENT/ADMIN/SUPER_ADMIN)
- `GET /api/v1/parent/wards/:studentId` (Auth + PARENT/ADMIN/SUPER_ADMIN)
- `GET /api/v1/admin/stats` (Auth + ADMIN/SUPER_ADMIN)

---

## 8. API Compatibility & Migration Plan

The response structure from the Node.js backend strictly preserves the contract generated by `App\Core\Response`:

**Success Response**:
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Error description"
}
```

No alterations to payload field names will be made, guaranteeing 100% contract compatibility with `frontend/src/services/api.ts`.

---

## 9. Authentication Migration Plan

- **Password Verification**:
  The PHP application uses standard `password_hash()` (Bcrypt / Argon2id).
  Node.js `bcrypt` package natively verifies `$2a$` and `$2b$` Bcrypt hashes. `argon2` npm package is included to handle any `$argon2id$` hashes if configured.
  New user registrations in Node.js will hash passwords using `bcrypt.hash(password, 10)`.

- **JWT Tokens**:
  Tokens are signed via HMAC SHA-256 (`HS256`).
  JWT structure:
  ```json
  {
    "id": 1,
    "email": "user@gacvi.org",
    "first_name": "FirstName",
    "last_name": "LastName",
    "role": "STUDENT",
    "roles": ["STUDENT"],
    "iat": 1700000000,
    "exp": 1700086400
  }
  ```
  The Node.js backend uses `jsonwebtoken` with `JWT_SECRET` (default fallback `gacvi_jwt_secret_key_change_in_production_2026`).

---

## 10. Authorization / RBAC Mapping

The authorization matrix is governed by user roles:
- `SUPER_ADMIN`: Full access to all endpoints without restriction.
- `ADMIN`: Full management access to courses, offerings, stats, teacher portal, parent portal.
- `TEACHER`: Access to `/api/v1/teacher/*`.
- `STUDENT`: Access to `/api/v1/enrollments`, `/api/v1/student/*`, `/api/v1/lms/*`.
- `PARENT`: Access to `/api/v1/parent/*`.

Centralized policy checks are enforced via `roleMiddleware(...allowedRoles)`.

---

## 11. File Upload / Storage Migration Plan

- Existing PHP implementation stores URLs as strings in database columns (`thumbnail_url`, `file_url`, `video_url`).
- Target Node.js implementation preserves string fields in Prisma models.
- Future cloud integration will stream file uploads to AWS S3 or Cloudinary, returning public URLs to be stored in PostgreSQL.

---

## 12. Email / Service Integration Mapping

- Email functionality is decoupled into a dedicated `EmailService` interface.
- Standard transactional templates (registration, enrollment confirmation, receipts) will be delivered via SendGrid/Resend API wrappers.

---

## 13. Business-Rule Mapping

1. **Physical Class Capacity Enforcement**:
   When a student enrolls in a physical course offering, the offering capacity is checked inside an atomic database transaction (`SELECT ... FOR UPDATE` equivalent in Prisma `$transaction`). If `enrolled_count >= capacity`, enrollment is rejected with HTTP 400.
2. **Duplicate Active Enrollment Guard**:
   Students cannot create an enrollment if an `ACTIVE` enrollment already exists for the same `offering_id`.
3. **Automated Quiz Grading**:
   The quiz engine compares submitted student answers against `quiz_questions.correct_answer`. Score is calculated as `(correct / total) * 100`. If `score >= passing_score`, `passed` is set to `1`.
4. **Idempotent Webhooks**:
   If a Stripe webhook is re-sent for an invoice that is already marked `PAID`, processing completes idempotently without double-incrementing `enrolled_count`.

---

## 14. Frontend Integration Plan

1. The React app (`frontend/`) consumes backend endpoints via `VITE_API_BASE`.
2. Environment configuration in `frontend/.env`:
   `VITE_API_BASE=http://localhost:4000/api/v1`
3. Running `npm run build` in `frontend/` verifies zero frontend build errors or broken API types.

---

## 15. Testing and Validation Strategy

1. **Unit Tests**:
   Jest test suites in `backend-node/tests/unit/` testing JWT utilities, password hashing verification, and response formatting.
2. **Integration Tests**:
   Supertest API integration tests in `backend-node/tests/integration/` testing live endpoints against an isolated PostgreSQL database.
3. **Behavioral Parity Testing**:
   Running identical test vectors against both PHP backend and Node.js backend to ensure payload parity.

---

## 16. Security Considerations

- Parameterized Prisma queries eliminate SQL injection risks.
- Password hashing using strong Bcrypt salt rounds.
- CORS restricted to allowed origins in environment configuration (`CORS_ORIGIN`).
- Error messages avoid leaking stack traces or internal filesystem paths in production mode.

---

## 17. Migration Phases

1. **Phase 1: Discovery & Specification** (Completed)
2. **Phase 2: Target Architecture & Prisma Setup** (Completed)
3. **Phase 3: Core Infrastructure & Auth Middleware** (Completed)
4. **Phase 4: Domain Modules Implementation** (Completed)
5. **Phase 5: Test Automation & Validation** (Completed)
6. **Phase 6: Frontend Integration & Build Verification** (Completed)
7. **Phase 7: Cutover & Production Deployment** (Pending)

---

## 18. Risks and Mitigations

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Password Hash Incompatibility** | High | Support both `bcrypt` and `argon2` algorithm decoders in Node.js auth service |
| **Race Conditions on Capacity** | High | Use atomic Prisma `$transaction` with optimistic/pessimistic state guards |
| **JWT Expiration / Signature Mismatch** | Medium | Maintain identical `JWT_SECRET` and HMAC SHA-256 claims structure |
| **Webhook Signature Mismatch** | Medium | Verify Stripe webhook signatures and implement idempotency checks |

---

## 19. Rollback Strategy

1. `backend/` (PHP implementation) remains untouched in the repository.
2. If any unforeseen critical issue arises on the Node.js backend, changing `VITE_API_BASE` in the frontend back to the PHP backend URL restores complete service instantly.

---

## 20. Data Integrity Validation

- Verify total record counts across `users`, `courses`, `course_offerings`, `enrollments`, `invoices`, `payments`, `attendance_records` before and after migration.
- Verify foreign key integrity between `user_roles`, `classrooms`, `lessons`, and `quiz_questions`.

---

## 21. Cutover Checklist

- [x] Node.js backend unit & integration tests pass.
- [x] Database migrations & Prisma schema defined for target PostgreSQL instance.
- [x] Database seed script executed and verified.
- [x] All 18 REST endpoints verified via Supertest and Jest suites.
- [x] Frontend updated with `VITE_API_BASE` pointing to Node.js backend.
- [x] Frontend build succeeds without errors.
- [ ] End-to-end user workflows (Login, Catalog Browse, Enrollment, Quiz Submission, Teacher Attendance, Parent Portal) tested and operational in production environment.

---

## 22. Known Unknowns and Unresolved Questions

- `UNKNOWN - REQUIRES VERIFICATION`: Stripe Webhook Signing Secret in Production (`STRIPE_WEBHOOK_SECRET`). Currently mock secret verification is used in testing mode.
- `UNKNOWN - REQUIRES VERIFICATION`: Production S3 bucket credentials for persistent file uploads (`AWS_S3_BUCKET`).

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding GACVI Database...');

  // Seed roles
  const rolesData = [
    { id: 1, name: 'SUPER_ADMIN', description: 'Super Administrator with full access' },
    { id: 2, name: 'ADMIN', description: 'Institutional Administrator' },
    { id: 3, name: 'TEACHER', description: 'Course Instructor' },
    { id: 4, name: 'STUDENT', description: 'Enrolled Student' },
    { id: 5, name: 'PARENT', description: 'Parent or Guardian' },
  ];

  for (const role of rolesData) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: { name: role.name, description: role.description },
      create: role,
    });
  }

  // Check existing users count
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    const passHash = await bcrypt.hash('Admin123!', 10);

    // Seed Users
    const admin = await prisma.user.create({
      data: {
        id: 1,
        first_name: 'System',
        last_name: 'Admin',
        email: 'admin@gacvi.org',
        password_hash: passHash,
        phone: '+1-800-555-0199',
        status: 'ACTIVE',
      },
    });

    const teacher = await prisma.user.create({
      data: {
        id: 2,
        first_name: 'Dr. Sarah',
        last_name: 'Jenkins',
        email: 'teacher@gacvi.org',
        password_hash: passHash,
        phone: '+1-800-555-0100',
        status: 'ACTIVE',
      },
    });

    const student = await prisma.user.create({
      data: {
        id: 3,
        first_name: 'Alex',
        last_name: 'Morgan',
        email: 'student@gacvi.org',
        password_hash: passHash,
        phone: '+1-800-555-0200',
        status: 'ACTIVE',
      },
    });

    const parent = await prisma.user.create({
      data: {
        id: 4,
        first_name: 'Robert',
        last_name: 'Morgan',
        email: 'parent@gacvi.org',
        password_hash: passHash,
        phone: '+1-800-555-0300',
        status: 'ACTIVE',
      },
    });

    // Assign Roles
    await prisma.userRole.createMany({
      data: [
        { user_id: admin.id, role_id: 1 },
        { user_id: teacher.id, role_id: 3 },
        { user_id: student.id, role_id: 4 },
        { user_id: parent.id, role_id: 5 },
      ],
    });

    // Parent Student Map
    await prisma.parentStudentMap.create({
      data: {
        parent_id: parent.id,
        student_id: student.id,
        relationship: 'FATHER',
      },
    });

    // Locations & Classrooms
    const loc1 = await prisma.location.create({
      data: {
        id: 1,
        name: 'GACVI Main Campus',
        address: '100 Vocational Way, Suite 200',
        city: 'Toronto',
        state: 'Ontario',
        country: 'Canada',
      },
    });

    const loc2 = await prisma.location.create({
      data: {
        id: 2,
        name: 'GACVI Health Innovation Hub',
        address: '45 Healthcare Boulevard',
        city: 'Lagos',
        state: 'Lagos State',
        country: 'Nigeria',
      },
    });

    const cr1 = await prisma.classrooms.create({
      data: {
        id: 1,
        location_id: loc1.id,
        room_number: 'Lab 101 - Clinical Skills Room',
        capacity: 25,
        facilities: 'Hospital Beds, Manikins, Phlebotomy Kits, Smart Screen',
      },
    });

    const cr2 = await prisma.classrooms.create({
      data: {
        id: 2,
        location_id: loc2.id,
        room_number: 'Room 204 - Vocational Lecture Hall',
        capacity: 40,
        facilities: 'Projector, AC, High-Speed WiFi, Audio System',
      },
    });

    // Courses
    const c1 = await prisma.course.create({
      data: {
        id: 1,
        title: 'Healthcare Assistant & Personal Support Specialist',
        code: 'HCA-101',
        category: 'Healthcare',
        description: 'Comprehensive training for clinical support, personal care, patient safety, and medical terminology.',
        thumbnail_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600',
        status: 'PUBLISHED',
      },
    });

    const c2 = await prisma.course.create({
      data: {
        id: 2,
        title: 'Phlebotomy & Laboratory Clinical Procedures',
        code: 'PLB-201',
        category: 'Medical Diagnostics',
        description: 'Hands-on training in blood collection techniques, specimen handling, safety protocols, and lab equipment.',
        thumbnail_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600',
        status: 'PUBLISHED',
      },
    });

    await prisma.course.create({
      data: {
        id: 3,
        title: 'Emergency First Aid & CPR Certification',
        code: 'EFA-100',
        category: 'Emergency Care',
        description: 'Essential life-saving techniques, AED operation, trauma care, and emergency response protocols.',
        thumbnail_url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600',
        status: 'PUBLISHED',
      },
    });

    // Offerings
    const off1 = await prisma.courseOffering.create({
      data: {
        id: 1,
        course_id: c1.id,
        delivery_mode: 'PHYSICAL',
        location_id: loc1.id,
        classroom_id: cr1.id,
        instructor_id: teacher.id,
        title: 'Healthcare Assistant - Toronto Main Campus Cohort A',
        capacity: 25,
        enrolled_count: 1,
        price: 1250.00,
        start_date: new Date('2026-10-01'),
        end_date: new Date('2026-12-15'),
        schedule_description: 'Saturdays 9:00 AM - 1:00 PM EST',
        status: 'OPEN',
      },
    });

    await prisma.courseOffering.create({
      data: {
        id: 2,
        course_id: c1.id,
        delivery_mode: 'ONLINE',
        location_id: null,
        classroom_id: null,
        instructor_id: teacher.id,
        title: 'Healthcare Assistant - Online Self-Paced Cohort',
        capacity: 100,
        enrolled_count: 0,
        price: 850.00,
        start_date: new Date('2026-10-01'),
        end_date: new Date('2027-04-01'),
        schedule_description: 'Flexible Online Access with Weekly Live Q&A',
        status: 'OPEN',
      },
    });

    await prisma.courseOffering.create({
      data: {
        id: 3,
        course_id: c2.id,
        delivery_mode: 'PHYSICAL',
        location_id: loc2.id,
        classroom_id: cr2.id,
        instructor_id: teacher.id,
        title: 'Phlebotomy Certification - Lagos Hub Weekend Class',
        capacity: 30,
        enrolled_count: 0,
        price: 950.00,
        start_date: new Date('2026-10-15'),
        end_date: new Date('2026-11-30'),
        schedule_description: 'Saturdays & Sundays 10:00 AM - 2:00 PM WAT',
        status: 'OPEN',
      },
    });

    // Modules & Lessons
    const m1 = await prisma.courseModule.create({
      data: {
        id: 1,
        course_id: c1.id,
        title: 'Module 1: Foundations of Clinical Care & Ethics',
        description: 'Patient dignity, HIPAA/Privacy laws, infection control.',
        sort_order: 1,
      },
    });

    const m2 = await prisma.courseModule.create({
      data: {
        id: 2,
        course_id: c1.id,
        title: 'Module 2: Vital Signs & Patient Monitoring',
        description: 'Measuring blood pressure, heart rate, oxygen levels, and documentation.',
        sort_order: 2,
      },
    });

    await prisma.lesson.create({
      data: {
        id: 1,
        module_id: m1.id,
        title: 'Introduction to Healthcare Assisting',
        content_type: 'VIDEO',
        content_body: 'Overview of healthcare support role, professional ethics, and safety.',
        video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        is_preview: 1,
        sort_order: 1,
      },
    });

    const l2 = await prisma.lesson.create({
      data: {
        id: 2,
        module_id: m1.id,
        title: 'Infection Prevention & PPE Standards',
        content_type: 'QUIZ',
        content_body: 'Detailed guidelines on proper hand hygiene, donning and doffing personal protective equipment (PPE).',
        is_preview: 0,
        sort_order: 2,
      },
    });

    const l3 = await prisma.lesson.create({
      data: {
        id: 3,
        module_id: m2.id,
        title: 'Accurate Measurement of Vital Signs',
        content_type: 'ASSIGNMENT',
        content_body: 'Demonstration of blood pressure measurement using sphygmomanometer and stethoscopes.',
        video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        is_preview: 0,
        sort_order: 1,
      },
    });

    // Quiz & Questions
    const q1 = await prisma.quiz.create({
      data: {
        id: 1,
        lesson_id: l2.id,
        title: 'Infection Control Readiness Quiz',
        time_limit_minutes: 15,
        passing_score: 75,
      },
    });

    await prisma.quizQuestion.createMany({
      data: [
        {
          id: 1,
          quiz_id: q1.id,
          question_text: 'What is the minimum duration recommended for washing hands with soap and water?',
          question_type: 'MULTIPLE_CHOICE',
          options_json: JSON.stringify(['5 seconds', '10 seconds', '20 seconds', '60 seconds']),
          correct_answer: '20 seconds',
        },
        {
          id: 2,
          quiz_id: q1.id,
          question_text: 'Which item of PPE should always be removed LAST?',
          question_type: 'MULTIPLE_CHOICE',
          options_json: JSON.stringify(['Gloves', 'Mask / N95 Respirator', 'Gown', 'Goggles']),
          correct_answer: 'Mask / N95 Respirator',
        },
      ],
    });

    // Assignment
    await prisma.assignment.create({
      data: {
        id: 1,
        lesson_id: l3.id,
        title: 'Patient Vital Signs Case Study',
        instructions: 'Read the provided clinical case study and record blood pressure, pulse rate, and oxygenation analysis in a 2-page report.',
        max_score: 100,
        due_date: new Date('2026-11-15T23:59:59Z'),
      },
    });

    // Seed Enrollment for Alex Morgan
    await prisma.enrollment.create({
      data: {
        id: 1,
        student_id: student.id,
        offering_id: off1.id,
        status: 'ACTIVE',
      },
    });

    const inv = await prisma.invoice.create({
      data: {
        id: 1,
        invoice_number: 'INV-2026-0001',
        student_id: student.id,
        offering_id: off1.id,
        amount: 1250.00,
        currency: 'USD',
        status: 'PAID',
      },
    });

    await prisma.payment.create({
      data: {
        id: 1,
        invoice_id: inv.id,
        transaction_ref: 'TRX-GACVI-10001',
        stripe_payment_intent_id: 'pi_mock_stripe_12345',
        amount: 1250.00,
        payment_method: 'STRIPE',
        status: 'SUCCESS',
      },
    });

    await prisma.attendanceRecord.create({
      data: {
        id: 1,
        offering_id: off1.id,
        student_id: student.id,
        class_date: new Date('2026-10-03'),
        status: 'PRESENT',
        remarks: 'On time and fully engaged in practical lab',
        recorded_by: teacher.id,
      },
    });
  }

  console.log('Database seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

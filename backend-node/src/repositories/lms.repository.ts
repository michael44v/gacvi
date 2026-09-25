import { prisma } from '../config/prisma.config';

export class LmsRepository {
  public async getQuizQuestions(quizId: number) {
    return await prisma.quizQuestion.findMany({
      where: { quiz_id: quizId },
    });
  }

  public async getQuizPassingScore(quizId: number) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: { passing_score: true },
    });
    return quiz ? quiz.passing_score : 70;
  }

  public async createQuizAttempt(data: {
    quiz_id: number;
    student_id: number;
    score: number;
    passed: number;
  }) {
    return await prisma.quizAttempt.create({
      data: {
        quiz_id: data.quiz_id,
        student_id: data.student_id,
        score: data.score,
        passed: data.passed,
      },
    });
  }

  public async createAssignmentSubmission(data: {
    assignment_id: number;
    student_id: number;
    file_url?: string;
    submission_text?: string;
  }) {
    return await prisma.assignmentSubmission.create({
      data: {
        assignment_id: data.assignment_id,
        student_id: data.student_id,
        file_url: data.file_url || null,
        submission_text: data.submission_text || null,
        status: 'SUBMITTED',
      },
    });
  }
}

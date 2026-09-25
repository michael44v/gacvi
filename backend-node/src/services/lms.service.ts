import { LmsRepository } from '../repositories/lms.repository';

export class LmsService {
  private lmsRepo: LmsRepository;

  constructor() {
    this.lmsRepo = new LmsRepository();
  }

  public async submitQuiz(userId: number, quizId: number, answers: Record<string | number, string>) {
    if (!quizId || !answers || Object.keys(answers).length === 0) {
      throw { statusCode: 400, message: 'Quiz ID and answers required' };
    }

    const questions = await this.lmsRepo.getQuizQuestions(quizId);
    if (questions.length === 0) {
      throw { statusCode: 400, message: 'Quiz has no questions' };
    }

    let correctCount = 0;
    for (const q of questions) {
      const qId = q.id;
      const studentAns = answers[qId] || answers[String(qId)];

      if (
        studentAns &&
        studentAns.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()
      ) {
        correctCount++;
      }
    }

    const score = Number(((correctCount / questions.length) * 100).toFixed(2));
    const passingScore = await this.lmsRepo.getQuizPassingScore(quizId);
    const passed = score >= passingScore ? 1 : 0;

    await this.lmsRepo.createQuizAttempt({
      quiz_id: quizId,
      student_id: userId,
      score,
      passed,
    });

    return {
      score,
      passed: Boolean(passed),
      passing_score: passingScore,
      correct_count: correctCount,
      total_questions: questions.length,
    };
  }

  public async submitAssignment(
    userId: number,
    assignmentId: number,
    submissionText?: string,
    fileUrl?: string
  ) {
    const text = submissionText ? submissionText.trim() : '';
    const url = fileUrl ? fileUrl.trim() : '';

    if (!assignmentId || (!text && !url)) {
      throw {
        statusCode: 400,
        message: 'Assignment ID and submission content or file URL required',
      };
    }

    await this.lmsRepo.createAssignmentSubmission({
      assignment_id: assignmentId,
      student_id: userId,
      submission_text: text,
      file_url: url,
    });

    return null;
  }
}

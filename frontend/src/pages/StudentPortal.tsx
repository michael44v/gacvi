import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Enrollment } from '../types';
import { BookOpen, MapPin, PlayCircle, FileText, Upload, HelpCircle } from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [offeringDetails, setOfferingDetails] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const [assignmentText, setAssignmentText] = useState('');
  const [assignmentSuccess, setAssignmentSuccess] = useState(false);

  useEffect(() => {
    api.getMyEnrollments()
      .then((data) => {
        setEnrollments(data);
        if (data.length > 0) {
          handleSelectEnrollment(data[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectEnrollment = async (enr: Enrollment) => {
    setSelectedEnrollment(enr);
    setSelectedLesson(null);
    setQuizResult(null);
    setQuizAnswers({});
    try {
      const details = await api.getOffering(enr.offering_id);
      setOfferingDetails(details);
      if (details.modules?.[0]?.lessons?.[0]) {
        setSelectedLesson(details.modules[0].lessons[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuizSubmit = async (quizId: number) => {
    setSubmittingQuiz(true);
    setQuizResult(null);
    try {
      const res = await api.submitQuiz(quizId, quizAnswers);
      setQuizResult(res);
    } catch (err: any) {
      alert(err.message || 'Error submitting quiz');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleAssignmentSubmit = async (assignmentId: number) => {
    if (!assignmentText) {
      alert('Please enter your assignment report before submitting.');
      return;
    }
    try {
      await api.submitAssignment(assignmentId, assignmentText);
      setAssignmentSuccess(true);
      setAssignmentText('');
    } catch (err: any) {
      alert(err.message || 'Error submitting assignment');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading Student LMS...</div>;

  return (
    <div className="portal-page-container">

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800', color: 'var(--primary-navy)' }}>
          Student Learning Management System (LMS)
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Access your enrolled active vocational courses, physical class schedules, video lectures, quizzes, and clinical assignments.
        </p>
      </div>

      {enrollments.length === 0 ? (
        <div style={{ backgroundColor: '#FFFFFF', padding: '32px 20px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
          <BookOpen size={48} color="var(--primary-navy)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>No Active Enrollments Found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Browse our physical or online course offerings catalog and enroll today.</p>
        </div>
      ) : (
        <div className="portal-grid">

          <div>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                My Enrolled Offerings
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {enrollments.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => handleSelectEnrollment(e)}
                    style={{
                      textAlign: 'left',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: selectedEnrollment?.id === e.id ? 'var(--primary-navy)' : '#F8FAFC',
                      color: selectedEnrollment?.id === e.id ? '#FFFFFF' : 'var(--text-primary)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: selectedEnrollment?.id === e.id ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                      {e.course_code} • {e.delivery_mode}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', marginTop: '2px' }}>
                      {e.offering_title}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {offeringDetails?.modules && (
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                  Course Syllabus Content
                </div>
                {offeringDetails.modules.map((mod: any, mIdx: number) => (
                  <div key={mod.id} style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-navy)', marginBottom: '8px' }}>
                      Module {mIdx + 1}: {mod.title}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px' }}>
                      {mod.lessons.map((les: any) => (
                        <button
                          key={les.id}
                          onClick={() => { setSelectedLesson(les); setQuizResult(null); setAssignmentSuccess(false); }}
                          style={{
                            textAlign: 'left',
                            padding: '8px 10px',
                            borderRadius: '4px',
                            backgroundColor: selectedLesson?.id === les.id ? '#E0F2FE' : 'transparent',
                            color: selectedLesson?.id === les.id ? '#0369A1' : 'var(--text-primary)',
                            fontSize: '0.85rem',
                            fontWeight: selectedLesson?.id === les.id ? '700' : '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          {les.content_type === 'VIDEO' && <PlayCircle size={16} />}
                          {les.content_type === 'TEXT' && <FileText size={16} />}
                          {les.content_type === 'QUIZ' && <HelpCircle size={16} />}
                          {les.content_type === 'ASSIGNMENT' && <Upload size={16} />}
                          <span>{les.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>

            {selectedEnrollment?.delivery_mode === 'PHYSICAL' && (
              <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B', padding: '16px 20px', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#92400E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={18} color="#92400E" /> Physical Classroom Assignment
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#78350F', marginTop: '4px' }}>
                    {selectedEnrollment.location_name} — {selectedEnrollment.classroom_name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#B45309' }}>
                    Schedule: {selectedEnrollment.schedule_description}
                  </div>
                </div>
                <div>
                  <span className="badge badge-active">Enrollment Active</span>
                </div>
              </div>
            )}

            {selectedLesson ? (
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                  <div>
                    <span className="badge badge-online" style={{ marginBottom: '8px', display: 'inline-block' }}>{selectedLesson.content_type}</span>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary-navy)' }}>{selectedLesson.title}</h2>
                  </div>
                </div>

                {selectedLesson.content_type === 'VIDEO' && (
                  <div>
                    <div style={{ backgroundColor: '#000000', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '20px' }}>
                      <video controls style={{ width: '100%', maxHeight: '420px' }} src={selectedLesson.video_url || 'https://www.w3schools.com/html/mov_bbb.mp4'}>
                        Your browser does not support video playback.
                      </video>
                    </div>
                    <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      {selectedLesson.content_body || 'Watch the lecture video above carefully before attempting the quiz.'}
                    </div>
                  </div>
                )}

                {selectedLesson.content_type === 'TEXT' && (
                  <div style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.7, backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    {selectedLesson.content_body}
                  </div>
                )}

                {selectedLesson.content_type === 'QUIZ' && selectedLesson.quiz && (
                  <div>
                    <div style={{ backgroundColor: '#F0F9FF', padding: '16px', borderRadius: '8px', border: '1px solid #BAE6FD', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0369A1', marginBottom: '4px' }}>{selectedLesson.quiz.title}</h3>
                      <div style={{ fontSize: '0.85rem', color: '#0284C7' }}>
                        Time Limit: {selectedLesson.quiz.time_limit_minutes} Mins • Passing Score: {selectedLesson.quiz.passing_score}%
                      </div>
                    </div>

                    {quizResult ? (
                      <div style={{ textAlign: 'center', padding: '24px', backgroundColor: quizResult.passed ? '#DCFCE7' : '#FEE2E2', borderRadius: '12px', border: `1px solid ${quizResult.passed ? '#22C55E' : '#EF4444'}` }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: quizResult.passed ? '#15803D' : '#991B1B', marginBottom: '8px' }}>
                          {quizResult.passed ? '🎉 Quiz Passed!' : '❌ Quiz Needs Retake'}
                        </h3>
                        <p style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px' }}>Your Score: {quizResult.score}% ({quizResult.correct_count}/{quizResult.total_questions} Correct)</p>
                        <button onClick={() => setQuizResult(null)} className="btn-outline">Retake Quiz</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {selectedLesson.quiz.questions.map((q: any, qIdx: number) => {
                          const options = JSON.parse(q.options_json || '[]');
                          return (
                            <div key={q.id} style={{ border: '1px solid var(--border-color)', padding: '16px', borderRadius: '8px' }}>
                              <div style={{ fontWeight: '700', marginBottom: '12px' }}>
                                Q{qIdx + 1}. {q.question_text}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {options.map((opt: string, optIdx: number) => (
                                  <label key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', cursor: 'pointer', padding: '8px 12px', borderRadius: '6px', backgroundColor: quizAnswers[q.id] === opt ? '#F1F5F9' : 'transparent', border: '1px solid', borderColor: quizAnswers[q.id] === opt ? 'var(--primary-navy)' : '#E2E8F0', minHeight: '44px' }}>
                                    <input
                                      type="radio"
                                      name={`question_${q.id}`}
                                      value={opt}
                                      checked={quizAnswers[q.id] === opt}
                                      onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                                      style={{ width: '18px', height: '18px', flexShrink: 0 }}
                                    />
                                    <span style={{ lineHeight: 1.4 }}>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          );
                        })}

                        <button
                          onClick={() => handleQuizSubmit(selectedLesson.quiz.id)}
                          disabled={submittingQuiz}
                          className="btn-gold"
                          style={{ width: '100%', maxWidth: '280px' }}
                        >
                          {submittingQuiz ? 'Evaluating...' : 'Submit Quiz Answers'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {selectedLesson.content_type === 'ASSIGNMENT' && selectedLesson.assignment && (
                  <div>
                    <div style={{ backgroundColor: '#FEF2F2', padding: '16px', borderRadius: '8px', border: '1px solid #FECACA', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#991B1B', marginBottom: '4px' }}>{selectedLesson.assignment.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: '#7F1D1D', marginBottom: '8px' }}>{selectedLesson.assignment.instructions}</p>
                      <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#B91C1C' }}>Max Score: {selectedLesson.assignment.max_score} pts</div>
                    </div>

                    {assignmentSuccess ? (
                      <div style={{ backgroundColor: '#DCFCE7', padding: '20px', borderRadius: '8px', color: '#15803D', fontWeight: '700', textAlign: 'center' }}>
                        ✓ Assignment submitted successfully! Instructor will grade your work.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <textarea
                          rows={6}
                          placeholder="Type your clinical report / assignment response here..."
                          value={assignmentText}
                          onChange={(e) => setAssignmentText(e.target.value)}
                          style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontFamily: 'inherit', fontSize: '0.9rem' }}
                        />
                        <button onClick={() => handleAssignmentSubmit(selectedLesson.assignment.id)} className="btn-primary" style={{ width: '100%', maxWidth: '280px' }}>
                          Submit Assignment
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                Select a lesson from the syllabus sidebar to begin learning.
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Flag,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/api/axios';

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'fill_in_blank';
  question: string;
  points: number;
  options?: string[];
  imageUrl?: string;
}

interface QuizData {
  id: number;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  maxAttempts: number;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  questions: QuizQuestion[];
}

interface QuizAnswer {
  questionId: string;
  answer: string | number;
}

const QuizTaking: React.FC = () => {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  // Load quiz data
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        // First get the quiz to find its course_id
        const quizResponse = await api.get(`/quizzes/${quizId}`);
        const courseId = quizResponse.data.course_id;

        // Then fetch full quiz details with questions
        const response = await api.get(`/courses/${courseId}/quizzes/${quizId}`);
        const quizData = response.data;

        setQuiz({
          id: quizData.id,
          title: quizData.title,
          description: quizData.description,
          timeLimit: quizData.timeLimit,
          passingScore: quizData.passingScore,
          maxAttempts: quizData.maxAttempts,
          randomizeQuestions: quizData.randomizeQuestions,
          showCorrectAnswers: quizData.showCorrectAnswers,
          questions: quizData.questions || []
        });

        setTimeRemaining(quizData.timeLimit * 60); // Convert to seconds
      } catch (error) {
        toast.error('Failed to load quiz');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (!quiz || isSubmitted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, isSubmitted, timeRemaining]);

  // Update answer
  const updateAnswer = (questionId: string, answer: string | number) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) {
        return prev.map(a => a.questionId === questionId ? { ...a, answer } : a);
      }
      return [...prev, { questionId, answer }];
    });
  };

  // Get answer for question
  const getAnswer = (questionId: string): string | number => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer?.answer ?? '';
  };

  // Submit quiz
  const handleSubmit = async () => {
    if (submitting) return;

    // Check if all questions are answered
    const unansweredQuestions = quiz!.questions.filter(q => {
      const answer = getAnswer(q.id);
      return !answer && answer !== 0;
    });

    if (unansweredQuestions.length > 0 && !isSubmitted) {
      const confirm = window.confirm(
        `You have ${unansweredQuestions.length} unanswered question(s). Submit anyway?`
      );
      if (!confirm) return;
    }

    setSubmitting(true);
    try {
      // Get quiz to find course_id
      const quizResponse = await api.get(`/quizzes/${quizId}`);
      const courseId = quizResponse.data.course_id;

      // Convert answers to API format
      const answersObj: { [key: string]: string | number } = {};
      answers.forEach(a => {
        answersObj[a.questionId] = a.answer;
      });

      // Submit quiz
      const response = await api.post(`/courses/${courseId}/quizzes/${quizId}/submit`, {
        answers: answersObj
      });

      const percentage = response.data.percentage;
      setScore(percentage);
      setIsSubmitted(true);

      if (response.data.passed) {
        toast.success('Congratulations! You passed the quiz!');
      } else {
        toast.error(`You scored ${percentage}%. Passing score is ${quiz!.passingScore}%`);
      }
    } catch (error) {
      toast.error('Failed to submit quiz');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Quiz Not Found</h2>
          <button onClick={() => navigate(-1)} className="btn btn-primary mt-4">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Results view
  if (isSubmitted && score !== null) {
    const passed = score >= quiz.passingScore;

    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="container-custom max-w-3xl">
          <div className="bg-white rounded-xl shadow-soft p-8 text-center">
            {passed ? (
              <>
                <Award className="w-24 h-24 text-success-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                  Congratulations!
                </h1>
                <p className="text-xl text-neutral-600 mb-6">
                  You passed the quiz with a score of {score}%
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-24 h-24 text-danger-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                  Better Luck Next Time
                </h1>
                <p className="text-xl text-neutral-600 mb-6">
                  You scored {score}%. Passing score is {quiz.passingScore}%
                </p>
              </>
            )}

            <div className="bg-neutral-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Your Score</p>
                  <p className="text-2xl font-bold text-neutral-900">{score}%</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Passing Score</p>
                  <p className="text-2xl font-bold text-neutral-900">{quiz.passingScore}%</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 mb-1">Questions</p>
                  <p className="text-2xl font-bold text-neutral-900">{quiz.questions.length}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="btn btn-outline"
              >
                Back to Course
              </button>
              {!passed && (
                <button
                  onClick={() => window.location.reload()}
                  className="btn btn-primary"
                >
                  Retry Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const isTimeCritical = timeRemaining < 300; // Less than 5 minutes

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{quiz.title}</h1>
              <p className="text-neutral-600 text-sm mt-1">{quiz.description}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isTimeCritical ? 'bg-danger-50 text-danger-700' : 'bg-neutral-100 text-neutral-700'
            }`}>
              <Clock className="w-5 h-5" />
              <span className="font-semibold text-lg">{formatTime(timeRemaining)}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-neutral-600 mt-2">
            <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Question Card */}
        {!showAllQuestions ? (
          <div className="bg-white rounded-xl shadow-soft p-8 mb-6">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-900 flex-1">
                  {currentQ.question}
                </h2>
                <span className="badge bg-primary-100 text-primary-700 ml-4">
                  {currentQ.points} {currentQ.points === 1 ? 'point' : 'points'}
                </span>
              </div>

              {currentQ.imageUrl && (
                <img
                  src={currentQ.imageUrl}
                  alt="Question"
                  className="w-full max-w-md rounded-lg mb-6"
                />
              )}
            </div>

            {/* Multiple Choice */}
            {currentQ.type === 'multiple_choice' && currentQ.options && (
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      getAnswer(currentQ.id) === index
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQ.id}`}
                      checked={getAnswer(currentQ.id) === index}
                      onChange={() => updateAnswer(currentQ.id, index)}
                      className="radio mt-1"
                    />
                    <span className="text-neutral-900">{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* True/False */}
            {currentQ.type === 'true_false' && (
              <div className="space-y-3">
                <label
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    getAnswer(currentQ.id) === 'true'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-primary-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    checked={getAnswer(currentQ.id) === 'true'}
                    onChange={() => updateAnswer(currentQ.id, 'true')}
                    className="radio"
                  />
                  <span className="text-neutral-900 font-medium">True</span>
                </label>
                <label
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    getAnswer(currentQ.id) === 'false'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-primary-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    checked={getAnswer(currentQ.id) === 'false'}
                    onChange={() => updateAnswer(currentQ.id, 'false')}
                    className="radio"
                  />
                  <span className="text-neutral-900 font-medium">False</span>
                </label>
              </div>
            )}

            {/* Short Answer */}
            {currentQ.type === 'short_answer' && (
              <input
                type="text"
                value={getAnswer(currentQ.id) as string}
                onChange={(e) => updateAnswer(currentQ.id, e.target.value)}
                placeholder="Enter your answer..."
                className="input w-full"
              />
            )}

            {/* Essay */}
            {currentQ.type === 'essay' && (
              <textarea
                value={getAnswer(currentQ.id) as string}
                onChange={(e) => updateAnswer(currentQ.id, e.target.value)}
                placeholder="Enter your answer..."
                className="input w-full min-h-[200px]"
                rows={8}
              />
            )}
            {/* Fill in the Blank */}
            {currentQ.type === 'fill_in_blank' && (
              <div className="space-y-3">
                <p className="text-sm text-neutral-500">Fill in the blank(s) below:</p>
                <div className="flex flex-wrap items-center gap-1 text-base leading-loose">
                  {currentQ.question.split(/_{3,}|\[blank\]/gi).map((part: string, i: number, arr: string[]) => (
                    <span key={i} className="flex items-center gap-1 flex-wrap">
                      <span>{part}</span>
                      {i < arr.length - 1 && (
                        <input
                          type="text"
                          value={Array.isArray(getAnswer(currentQ.id)) ? (getAnswer(currentQ.id) as string[])[i] || '' : i === 0 ? (getAnswer(currentQ.id) as string) || '' : ''}
                          onChange={(e) => {
                            const prev = Array.isArray(getAnswer(currentQ.id)) ? [...(getAnswer(currentQ.id) as string[])] : [getAnswer(currentQ.id) as string || '']
                            while (prev.length <= i) prev.push('')
                            prev[i] = e.target.value
                            updateAnswer(currentQ.id, prev.length === 1 ? prev[0] : prev)
                          }}
                          placeholder="type here"
                          className="border-b-2 border-primary-500 outline-none px-2 py-0.5 min-w-[120px] bg-primary-50 rounded text-center text-sm font-medium"
                        />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* All Questions View */
          <div className="space-y-6 mb-6">
            {quiz.questions.map((q, index) => (
              <div key={q.id} className="bg-white rounded-xl shadow-soft p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">
                    {index + 1}. {q.type === 'fill_in_blank' ? '' : q.question}
                  </h3>
                  <span className="badge bg-primary-100 text-primary-700">
                    {q.points} pts
                  </span>
                </div>

                {/* Render appropriate input based on question type */}
                {q.type === 'multiple_choice' && q.options && (
                  <div className="space-y-2">
                    {q.options.map((option, optIndex) => (
                      <label key={optIndex} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          checked={getAnswer(q.id) === optIndex}
                          onChange={() => updateAnswer(q.id, optIndex)}
                          className="radio"
                        />
                        <span className="text-neutral-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'true_false' && (
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        checked={getAnswer(q.id) === 'true'}
                        onChange={() => updateAnswer(q.id, 'true')}
                        className="radio"
                      />
                      <span>True</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        checked={getAnswer(q.id) === 'false'}
                        onChange={() => updateAnswer(q.id, 'false')}
                        className="radio"
                      />
                      <span>False</span>
                    </label>
                  </div>
                )}

                {q.type === 'short_answer' && (
                  <input
                    type="text"
                    value={getAnswer(q.id) as string}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                    placeholder="Your answer..."
                    className="input w-full"
                  />
                )}

                {q.type === 'essay' && (
                  <textarea
                    value={getAnswer(q.id) as string}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                    placeholder="Your answer..."
                    className="input w-full"
                    rows={4}
                  />
                )}
                {q.type === 'fill_in_blank' && (
                  <div className="flex flex-wrap items-center gap-1 text-base leading-loose mt-2">
                    {q.question.split(/_{3,}/gi).map((part: string, i: number, arr: string[]) => (
                      <span key={i} className="flex items-center gap-1 flex-wrap">
                        <span className="text-white">{part}</span>
                        {i < arr.length - 1 && (
                          <input
                            type="text"
                            value={Array.isArray(getAnswer(q.id)) ? ((getAnswer(q.id) as string[])[i] || '') : (i === 0 ? (getAnswer(q.id) as string || '') : '')}
                            onChange={(e) => {
                              const prev = Array.isArray(getAnswer(q.id)) ? [...(getAnswer(q.id) as string[])] : [(getAnswer(q.id) as string || '')]
                              while (prev.length <= i) prev.push('')
                              prev[i] = e.target.value
                              updateAnswer(q.id, prev.length === 1 ? prev[0] : prev)
                            }}
                            placeholder="answer"
                            className="border-b-2 border-orange-500 outline-none px-2 py-0.5 min-w-[120px] bg-orange-50 rounded text-center text-sm font-medium text-gray-900 placeholder-gray-400"
                          />
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setShowAllQuestions(!showAllQuestions)}
                className="btn btn-outline"
              >
                {showAllQuestions ? 'Single Question View' : 'View All Questions'}
              </button>
            </div>

            {!showAllQuestions && (
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  className="btn btn-outline"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Previous
                </button>

                {currentQuestion < quiz.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                    className="btn btn-primary"
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn btn-primary"
                  >
                    <Flag className="w-5 h-5 mr-2" />
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                  </button>
                )}
              </div>
            )}

            {showAllQuestions && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn btn-primary"
              >
                <Flag className="w-5 h-5 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTaking;

import * as React from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  ArrowLeft,
  CheckCircle,
  CheckCircle2,
  Circle,
  List,
  X,
  Settings,
  StickyNote,
  Keyboard,
  Trash2,
  Plus,
  PictureInPicture,
  Gauge,
  Palette,
  Shield,
  Eye,
  EyeOff,
  Heart,
  ThumbsUp,
  Smile,
  Sparkles,
  Trophy,
  Target,
  Brain,
  Lightbulb,
  Flame,
  Star,
  Award,
  HelpCircle,
  PenTool,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { VideoPlayer, type VideoPlayerHandle } from "@/components/video/video-player"
import { cn } from "@/utils/cn"
import { api } from "@/api/axios"
import toast from "react-hot-toast"
import { useTheme, Theme, themeConfig } from "@/contexts/theme-context"
import { celebrationAnimation, rippleEffect, pulseGlow } from "@/utils/animations"
import { getBackendUrl, getCertificateUrl } from "@/config/urls"

// Quiz Renderer Component
const QuizRenderer: React.FC<{ quizId: number; courseId: number; onNext?: () => void }> = ({ quizId, courseId, onNext }) => {
  const [quiz, setQuiz] = React.useState<any>(null)
  const [answers, setAnswers] = React.useState<{ [key: string]: any }>({})
  const [submitted, setSubmitted] = React.useState(false)
  const [score, setScore] = React.useState(0)
  const [showExplanations, setShowExplanations] = React.useState(false)
  const [previousAttempt, setPreviousAttempt] = React.useState<any>(null)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    const loadQuiz = async () => {
      try {
        // Fetch full quiz with questions
        const response = await api.get(`/courses/${courseId}/quizzes/${quizId}`)
        setQuiz(response.data)

        // Check if user has a previous attempt
        const attemptResponse = await api.get(`/courses/${courseId}/quizzes/${quizId}/attempt`)
        if (attemptResponse.data) {
          setPreviousAttempt(attemptResponse.data)
          setAnswers(attemptResponse.data.answers || {})
          setSubmitted(true)
          setScore(attemptResponse.data.percentage)
        }
      } catch (error) {
        console.error('Failed to load quiz:', error)
        toast.error('Failed to load quiz')
      }
    }
    loadQuiz()
  }, [quizId, courseId])

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = async () => {
    if (!quiz || submitting) return

    setSubmitting(true)

    try {
      const response = await api.post(`/courses/${courseId}/quizzes/${quizId}/submit`, {
        answers: answers
      })

      const result = response.data
      setScore(result.percentage)
      setSubmitted(true)
      setShowExplanations(true)
      setPreviousAttempt(result)

      if (result.passed) {
        toast.success(`Passed! Score: ${result.percentage}%`)
      } else {
        toast.error(`Score: ${result.percentage}%. Passing: ${result.passing_grade}%`)
      }
    } catch (error: any) {
      console.error('Failed to submit quiz:', error)
      toast.error(error.response?.data?.detail || 'Failed to submit quiz')
    } finally {
      setSubmitting(false)
    }
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-full bg-neutral-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-neutral-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-neutral-400">{quiz.description}</p>
          <div className="flex gap-4 mt-4 text-sm">
            <span className="text-neutral-500">⏱️ {quiz.timeLimit} minutes</span>
            <span className="text-neutral-500">📊 Passing: {quiz.passingScore}%</span>
            <span className="text-neutral-500">📝 {quiz.questions?.length || 0} questions</span>
          </div>
        </div>

        {submitted && (
          <div className="mb-8">
            {/* Results Screen with Percentage Meter */}
            <div className={cn(
              "p-8 rounded-2xl border-2 text-center",
              score >= quiz.passingScore
                ? "bg-gradient-to-br from-green-900/40 to-green-800/20 border-green-600"
                : "bg-gradient-to-br from-red-900/40 to-red-800/20 border-red-600"
            )}>
              <h2 className="text-3xl font-bold mb-4">
                {score >= quiz.passingScore ? '🎉 Congratulations!' : '📚 Keep Learning'}
              </h2>

              {/* Circular Percentage Meter */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-neutral-700"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - score / 100)}`}
                    className={score >= quiz.passingScore ? "text-green-500" : "text-red-500"}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div>
                    <div className="text-5xl font-bold">{score.toFixed(0)}%</div>
                    <div className="text-sm text-neutral-400 mt-1">Your Score</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <p className="text-lg">
                  <span className={score >= quiz.passingScore ? "text-green-400" : "text-red-400"}>
                    {score >= quiz.passingScore ? '✅ Passed!' : '❌ Not Passed'}
                  </span>
                </p>
                <p className="text-neutral-300">
                  {previousAttempt ? `${previousAttempt.earned_marks}/${previousAttempt.total_marks}` : `${Math.round((score / 100) * quiz.questions.length)}/${quiz.questions.length}`} correct answers
                </p>
                <p className="text-sm text-neutral-400">
                  Passing grade: {quiz.passingScore}%
                </p>
              </div>

              {/* Next Lesson Button */}
              {onNext && (
                <Button
                  onClick={onNext}
                  size="lg"
                  className="px-8"
                >
                  Next Lesson →
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {quiz.questions?.map((question: any, index: number) => {
            const userAnswer = answers[question.id]
            const isCorrect = submitted && (
              question.type === 'multiple_choice' ? userAnswer === question.correctAnswer :
                question.type === 'true_false' ? userAnswer === question.correctAnswer :
                question.type === 'fill_in_blank' ? String(userAnswer || '').trim().toLowerCase() === String(question.correctAnswer || '').trim().toLowerCase() :
                  null
            )

            return (
              <div key={question.id} className="bg-neutral-800 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-primary-500 font-bold">Q{index + 1}</span>
                  <div className="flex-1">
                    {question.type !== "fill_in_blank" && <p className="text-lg font-medium">{question.question}</p>}
                    <span className="text-sm text-neutral-500">{question.points} points</span>
                  </div>
                  {submitted && (
                    <span className={cn(
                      "text-2xl",
                      isCorrect ? "text-green-500" : "text-red-500"
                    )}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                  )}
                </div>

                {question.type === 'multiple_choice' && (
                  <div className="space-y-2">
                    {question.options?.map((option: string, optIndex: number) => (
                      <label
                        key={optIndex}
                        className={cn(
                          "block p-3 rounded-lg border-2 cursor-pointer transition-all",
                          submitted ? (
                            optIndex === question.correctAnswer
                              ? "border-green-500 bg-green-900/30"
                              : userAnswer === optIndex
                                ? "border-red-500 bg-red-900/30"
                                : "border-neutral-700"
                          ) : (
                            userAnswer === optIndex
                              ? "border-primary-500 bg-primary-900/30"
                              : "border-neutral-700 hover:border-neutral-600"
                          )
                        )}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={optIndex}
                          checked={userAnswer === optIndex}
                          onChange={() => !submitted && handleAnswerChange(question.id, optIndex)}
                          disabled={submitted}
                          className="mr-3"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'true_false' && (
                  <div className="space-y-2">
                    {['true', 'false'].map((option) => (
                      <label
                        key={option}
                        className={cn(
                          "block p-3 rounded-lg border-2 cursor-pointer transition-all",
                          submitted ? (
                            option === question.correctAnswer
                              ? "border-green-500 bg-green-900/30"
                              : userAnswer === option
                                ? "border-red-500 bg-red-900/30"
                                : "border-neutral-700"
                          ) : (
                            userAnswer === option
                              ? "border-primary-500 bg-primary-900/30"
                              : "border-neutral-700 hover:border-neutral-600"
                          )
                        )}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option}
                          checked={userAnswer === option}
                          onChange={() => !submitted && handleAnswerChange(question.id, option)}
                          disabled={submitted}
                          className="mr-3"
                        />
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </label>
                    ))}
                  </div>
                )}

                {/* Fill in the Blank */}
                {question.type === 'fill_in_blank' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-1 text-base leading-loose">
                      {question.question.split(/_{3,}/gi).map((part: string, i: number, arr: string[]) => (
                        <span key={i} className="flex items-center gap-1 flex-wrap">
                          <span className="text-white">{part}</span>
                          {i < arr.length - 1 && (
                            submitted ? (
                              <span className={cn(
                                "inline-block px-3 py-1 rounded border-2 text-sm font-medium min-w-[100px] text-center",
                                userAnswer?.toString().toLowerCase() === question.correctAnswer?.toString().toLowerCase()
                                  ? "border-green-500 bg-green-900/30 text-green-300"
                                  : "border-red-500 bg-red-900/30 text-red-300"
                              )}>
                                {Array.isArray(userAnswer) ? userAnswer[i] : userAnswer}
                              </span>
                            ) : (
                              <input
                                type="text"
                                value={Array.isArray(userAnswer) ? (userAnswer[i] || '') : (i === 0 ? (userAnswer || '') : '')}
                                onChange={(e) => {
                                  const prev = Array.isArray(userAnswer) ? [...userAnswer] : [userAnswer || '']
                                  while (prev.length <= i) prev.push('')
                                  prev[i] = e.target.value
                                  handleAnswerChange(question.id, prev.length === 1 ? prev[0] : prev)
                                }}
                                placeholder="type here"
                                className="border-b-2 border-orange-400 outline-none px-2 py-1 min-w-[120px] bg-neutral-700 rounded text-center text-sm font-medium text-white placeholder-neutral-400 focus:border-orange-300"
                              />
                            )
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Show correct answer and explanation after submission */}
                {submitted && (
                  <div className="mt-4 space-y-3">
                    {/* Show correct answer for wrong answers */}
                    {!isCorrect && (
                      <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                        <p className="text-sm font-semibold text-green-300 mb-1">✓ Correct Answer:</p>
                        <p className="text-sm text-green-100">
                          {question.type === 'multiple_choice'
                            ? question.options[question.correctAnswer]
                            : question.correctAnswer.charAt(0).toUpperCase() + question.correctAnswer.slice(1)
                          }
                        </p>
                      </div>
                    )}
                    {/* Show explanation if available */}
                    {question.explanation && (
                      <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
                        <p className="text-sm font-semibold text-blue-300 mb-1">💡 Explanation:</p>
                        <p className="text-sm text-blue-100">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {!submitted && (
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleSubmit}
              size="lg"
              className="px-8"
              disabled={Object.keys(answers).length !== quiz.questions?.length || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// Assignment Renderer Component
const AssignmentRenderer: React.FC<{ assignmentId: number; courseId: number; onNext?: () => void }> = ({ assignmentId, courseId, onNext }) => {
  const [assignment, setAssignment] = React.useState<any>(null)
  const [submission, setSubmission] = React.useState<string>('')
  const [files, setFiles] = React.useState<File[]>([])
  const [submitted, setSubmitted] = React.useState(false)
  const [startDate, setStartDate] = React.useState<Date | null>(null)

  React.useEffect(() => {
    const loadAssignment = async () => {
      try {
        // Load assignment data
        const response = await api.get(`/courses/${courseId}/assignments/${assignmentId}`)
        setAssignment(response.data)

        // Check if already submitted or returned
        if (response.data.isSubmitted && response.data.submission) {
          const isReturned = response.data.submission.status === 'returned'
          setSubmitted(!isReturned) // Allow resubmission if returned
          setSubmission(response.data.submission.textContent || '')
        }

        // Set start date (when student first opens assignment)
        const savedStartDate = localStorage.getItem(`assignment_start_${assignmentId}`)
        if (savedStartDate) {
          setStartDate(new Date(savedStartDate))
        } else {
          const now = new Date()
          setStartDate(now)
          localStorage.setItem(`assignment_start_${assignmentId}`, now.toISOString())
        }
      } catch (error) {
        console.error('Failed to load assignment:', error)
        toast.error('Failed to load assignment')
      }
    }
    loadAssignment()
  }, [assignmentId, courseId])

  const handleSubmit = async () => {
    try {
      await api.post(`/assignments/${assignmentId}/submit`, {
        textContent: submission,
        files: [] // files would be uploaded separately
      })
      setSubmitted(true)
      toast.success('Assignment submitted successfully!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to submit assignment')
    }
  }

  if (!assignment) {
    return (
      <div className="flex items-center justify-center h-full bg-neutral-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Parse due date from API
  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null
  const daysRemaining = dueDate ? Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null

  const isReturned = assignment.submission?.status === 'returned'
  const isGraded = assignment.submission?.status === 'graded'

  return (
    <div className="h-full overflow-y-auto bg-neutral-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Returned Assignment Alert */}
        {isReturned && (
          <div className="bg-red-900/30 border-l-4 border-red-500 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Assignment Returned for Revision</h3>
                <p className="text-red-200 mb-4">
                  Your submission has been returned by the instructor. Please review the feedback below and resubmit.
                </p>
                {assignment.submission?.feedback && (
                  <div className="bg-neutral-800 rounded-lg p-4 border border-red-700">
                    <p className="text-sm font-semibold text-white mb-2">Instructor Feedback:</p>
                    <p className="text-sm text-neutral-300">{assignment.submission.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
          <p className="text-neutral-400 mb-4">{assignment.description}</p>

          <div className="bg-neutral-800 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-500">Started:</span>
                <p className="font-medium">{startDate?.toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-neutral-500">Due Date:</span>
                <p className={cn(
                  "font-medium",
                  daysRemaining && daysRemaining < 2 ? "text-red-400" : "text-white"
                )}>
                  {dueDate?.toLocaleDateString()}
                  {daysRemaining !== null && (
                    <span className="text-xs ml-2">
                      ({daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'})
                    </span>
                  )}
                </p>
              </div>
              <div>
                <span className="text-neutral-500">Points:</span>
                <p className="font-medium">{assignment.totalPoints}</p>
              </div>
              <div>
                <span className="text-neutral-500">Submission Type:</span>
                <p className="font-medium capitalize">{assignment.submissionType}</p>
              </div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none mb-6">
            <h2 className="text-xl font-semibold mb-3">Instructions</h2>
            <div dangerouslySetInnerHTML={{ __html: assignment.instructions || 'No instructions provided.' }} />
          </div>

          {/* Reference Files from Instructor */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="bg-neutral-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Reference Files</h2>
              <div className="space-y-3">
                {assignment.attachments.map((file: any, index: number) => {
                  const fileUrl = typeof file === 'string' ? file : file.url;
                  const fileName = typeof file === 'string' ? file.split('/').pop() : file.name;
                  const fileSize = typeof file === 'object' && file.size ?
                    (file.size < 1024 ? `${file.size} B` :
                      file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` :
                        `${(file.size / (1024 * 1024)).toFixed(1)} MB`) : '';
                  const fullUrl = fileUrl.startsWith('http') ? fileUrl : getBackendUrl(fileUrl);

                  return (
                    <a
                      key={index}
                      href={fullUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-white">{fileName}</p>
                          {fileSize && <p className="text-sm text-neutral-400">{fileSize}</p>}
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {!submitted ? (
          <div className="space-y-6">
            {(assignment.submissionType === 'text' || assignment.submissionType === 'both') && (
              <div>
                <label className="block text-sm font-medium mb-2">Your Submission</label>
                <textarea
                  value={submission}
                  onChange={(e) => setSubmission(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Write your submission here..."
                />
              </div>
            )}

            {(assignment.submissionType === 'file' || assignment.submissionType === 'both') && (
              <div>
                <label className="block text-sm font-medium mb-2">Upload Files</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg"
                />
                <p className="text-xs text-neutral-500 mt-2">
                  Max {assignment.maxFiles} files, {assignment.maxFileSize}MB each
                </p>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              size="lg"
              className="w-full"
              disabled={!submission && files.length === 0}
            >
              Submit Assignment
            </Button>
          </div>
        ) : (
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Assignment Submitted!</h2>
            <p className="text-neutral-400 mb-6">Your assignment has been submitted for grading.</p>
            {onNext && (
              <Button onClick={onNext} size="lg" className="px-8">
                Next Lesson →
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export const LessonPageRedesigned = () => {
  const { courseId, lessonId, id } = useParams<{ courseId?: string; lessonId?: string; id?: string }>()
  const navigate = useNavigate()
  const currentCourseId = id || courseId
  const { theme, setTheme } = useTheme()

  // State
  const [lesson, setLesson] = React.useState<any>(null)
  const [course, setCourse] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [sidebarOpen, setSidebarOpen] = React.useState(() => {
    // Start with sidebar closed on mobile, open on desktop
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024 // lg breakpoint
    }
    return true
  })
  const [showAutoAdvance, setShowAutoAdvance] = React.useState(false)
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = React.useState(5)
  const autoAdvanceTimerRef = React.useRef<any>(null)
  const [certificateAvailable, setCertificateAvailable] = React.useState(false)
  const [showCertificateBanner, setShowCertificateBanner] = React.useState(true)

  // Video player state
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [volume, setVolume] = React.useState(1)
  const [isMuted, setIsMuted] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [courseProgress, setCourseProgress] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [playbackRate, setPlaybackRate] = React.useState(1)
  const [showControls, setShowControls] = React.useState(true)
  const playerRef = React.useRef<VideoPlayerHandle>(null)

  // Enhanced features state
  const [notes, setNotes] = React.useState<Array<{ timestamp: number, content: string, id: string }>>([])
  const [showNotesPanel, setShowNotesPanel] = React.useState(false)
  const [currentNote, setCurrentNote] = React.useState('')
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = React.useState(false)
  const [showSpeedIndicator, setShowSpeedIndicator] = React.useState(false)
  const [isPiPMode, setIsPiPMode] = React.useState(false)
  const [videoQuality, setVideoQuality] = React.useState('auto')
  const [showQualitySelector, setShowQualitySelector] = React.useState(false)
  const [showThemeSwitcher, setShowThemeSwitcher] = React.useState(false)

  // Quiz/Checkpoint state
  const [checkpoints, setCheckpoints] = React.useState<Array<{
    timestamp: number
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
  }>>([])
  const [activeCheckpoint, setActiveCheckpoint] = React.useState<any>(null)
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null)
  const [checkpointAnswered, setCheckpointAnswered] = React.useState(false)

  // Advanced features state
  const [focusMode, setFocusMode] = React.useState(false)
  const [ambientLighting, setAmbientLighting] = React.useState(true)
  const [showReactions, setShowReactions] = React.useState(false)
  const [reactions, setReactions] = React.useState<Array<{ id: string, emoji: string, x: number, y: number }>>([])
  const [showAchievement, setShowAchievement] = React.useState<{ title: string, description: string, icon: string } | null>(null)
  const [comprehensionScore, setComprehensionScore] = React.useState(100)
  const [showStudyAssistant, setShowStudyAssistant] = React.useState(false)
  const [assistantMessage, setAssistantMessage] = React.useState('')
  const videoContainerRef = React.useRef<HTMLDivElement>(null)
  const sidebarRef = React.useRef<HTMLDivElement>(null)
  const activeItemRef = React.useRef<HTMLButtonElement>(null)

  // Fetch course and lesson data
  const courseLoaded = React.useRef(false)
  const fetchCourse = React.useCallback(async () => {
    try {
      if (!courseLoaded.current) setLoading(true)
      const api = (await import('@/api/axios')).api

      if (!currentCourseId) {
        console.error('No course ID provided')
        return
      }

      const courseResponse = await api.get(`/courses/${currentCourseId}`)
      const courseData = courseResponse.data

      // Combine lessons, quizzes, and assignments into course content
      const allContent = [
        ...(courseData.lessons || []).map((l: any) => ({ ...l, type: 'lesson', contentId: `lesson-${l.id}` })),
        ...(courseData.quizzes || []).map((q: any) => ({ ...q, type: 'quiz', lesson_title: q.title, contentId: `quiz-${q.id}` })),
        ...(courseData.assignments || []).map((a: any) => ({ ...a, type: 'assignment', lesson_title: a.title, contentId: `assignment-${a.id}` }))
      ]

      // Sort by creation date to maintain chronological order
      allContent.sort((a, b) => {
        const dateA = new Date(a.created_at || a.post_date || 0).getTime()
        const dateB = new Date(b.created_at || b.post_date || 0).getTime()
        return dateA - dateB
      })

      // Build sections from sections_meta if available
      let courseSections: any[] = []
      if (courseData.sections_meta) {
        try {
          const meta = JSON.parse(courseData.sections_meta)
          const contentMap = new Map(allContent.map((c: any) => [c.contentId, c]))
          // Normalize lectureIds - add prefix if missing
          const normalizeLid = (lid: string) => {
            if (lid.startsWith('lesson-')||lid.startsWith('quiz-')||lid.startsWith('assignment-')) return lid
            return 'lesson-' + lid
          }
          courseSections = meta.map((s: any) => ({
            id: s.id,
            title: s.title,
            description: s.description,
            lessons: (s.lectureIds || []).map((lid: string) => contentMap.get(normalizeLid(lid))).filter(Boolean)
          })).filter((s: any) => s.lessons.length > 0)
          // Add orphan lessons to last section or new section
          const assignedIds = new Set(meta.flatMap((s: any) => s.lectureIds || []))
          const orphans = allContent.filter((c: any) => !assignedIds.has(c.contentId))
          if (orphans.length > 0) {
            if (courseSections.length === 0) {
              courseSections.push({ id: 'default', title: 'Course Content', description: '', lessons: orphans })
            } else {
              courseSections[courseSections.length - 1].lessons.push(...orphans)
            }
          }
        } catch { courseSections = [] }
      }
      if (courseSections.length === 0) {
        courseSections = [{ id: 'default', title: 'Course Content', description: '', lessons: allContent }]
      }
      // Fetch lesson completion status
      let completedLessonIds: number[] = []
      try {
        const progressRes = await api.get(`/courses/${currentCourseId}/progress`)
        completedLessonIds = progressRes.data?.completed_lesson_ids || []
        // Mark completed lessons
        allContent.forEach((c: any) => {
          if (c.type === 'lesson') {
            c.is_completed = completedLessonIds.includes(c.id)
          }
        })
      } catch {}
      setCourse({
        id: courseData.id,
        title: courseData.title,
        lessons: allContent,
        sections: courseSections
      })

      // Check for certificate availability
      if (courseData.progress === 100 && courseData.enrollment_date) {
        try {
          const certResponse = await api.get(`/certificates/user/${currentCourseId}`)
          if (certResponse.data && certResponse.data.certificate) {
            setCertificateAvailable(true)
          }
        } catch (error) {
          // Certificate not available yet or error
          console.log('Certificate not available')
        }
      }
      if (!lessonId && allContent.length > 0) {
        const firstContent = allContent[0]
        navigate(`/courses/${currentCourseId}/lessons/${firstContent.contentId}`, { replace: true })
        return
      }


      if (lessonId && allContent.length > 0) {
        // Match by contentId (e.g., "quiz-1", "assignment-1", "lesson-1")
        let currentLesson = allContent.find((l: any) => l.contentId === lessonId)

        // Fallback: if lessonId is just a number (old format), try to find by ID and type
        if (!currentLesson) {
          currentLesson = allContent.find((l: any) => l.id === parseInt(lessonId) && l.type === 'lesson')
        }

        if (currentLesson) {
          // Store the current lesson type for rendering
          const videoUrl = currentLesson.lesson_video || ''
          const youtubeUrl = currentLesson.youtube_url || ''
          const fullVideoUrl = videoUrl.startsWith('/') ? getBackendUrl(videoUrl) : videoUrl

          // Prefer direct video uploads over YouTube URLs
          const primaryVideoUrl = fullVideoUrl || youtubeUrl

          setLesson({
            id: currentLesson.id,
            title: currentLesson.lesson_title || currentLesson.title,
            description: currentLesson.lesson_content || 'No description available',
            video_url: primaryVideoUrl,
            youtube_url: youtubeUrl,
            is_completed: false,
            is_preview: currentLesson.is_preview || false,
            type: currentLesson.type || 'lesson',
            attachment_url: currentLesson.attachment_url || '',
            content: currentLesson
          })
        }
      }
    } catch (error) {
      console.error('Error fetching course/lesson data:', error)
      toast.error('Failed to load lesson')
    } finally {
      courseLoaded.current = true
      setLoading(false)
    }
  }, [courseId, id, currentCourseId])

  React.useEffect(() => {
    fetchCourse()
  }, [fetchCourse])

  // Save sidebar scroll position before lessonId change and restore after
  const sidebarScrollPos = React.useRef(0)

  // Save scroll position when user scrolls sidebar
  React.useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar) return
    const onScroll = () => { sidebarScrollPos.current = sidebar.scrollTop }
    sidebar.addEventListener('scroll', onScroll, { passive: true })
    return () => sidebar.removeEventListener('scroll', onScroll)
  }, [])

  // Restore scroll position after EVERY render synchronously
  React.useLayoutEffect(() => {
    if (sidebarRef.current && sidebarScrollPos.current > 0) {
      sidebarRef.current.scrollTop = sidebarScrollPos.current
    }
  })

  // When lessonId changes, update active lesson from cached course data
  React.useEffect(() => {
    if (!lessonId || !course) return
    const allContent = course.lessons || []
    let currentLesson = allContent.find((l: any) => l.contentId === lessonId)
    if (!currentLesson) {
      currentLesson = allContent.find((l: any) => l.id === parseInt(lessonId) && l.type === 'lesson')
    }
    if (currentLesson) {
      const videoUrl = currentLesson.lesson_video || ''
      const youtubeUrl = currentLesson.youtube_url || ''
      const fullVideoUrl = videoUrl.startsWith('/') ? `${window.location.origin}${videoUrl}` : videoUrl
      const primaryVideoUrl = fullVideoUrl || youtubeUrl
      setLesson({
        id: currentLesson.id,
        title: currentLesson.lesson_title || currentLesson.title,
        description: currentLesson.lesson_content || 'No description available',
        video_url: primaryVideoUrl,
        youtube_url: youtubeUrl,
        is_completed: false,
        is_preview: currentLesson.is_preview || false,
        type: currentLesson.type || 'lesson',
        attachment_url: currentLesson.attachment_url || '',
        content: currentLesson
      })
    }
  }, [lessonId, course])

  // Video controls
  const handlePlayPause = () => setIsPlaying(!isPlaying)
  const handleProgress = (state: any) => {
    setProgress(state.played * 100)
    setCurrentTime(state.playedSeconds)
  }
  const handleDuration = (duration: number) => setDuration(duration)
  const handleSeek = (seconds: number) => {
    if (playerRef.current && duration > 0) {
      console.log("Seeking to:", seconds, "seconds, duration:", duration)
      // Use absolute seconds for video player
      playerRef.current.seekTo(seconds)
    } else {
      console.warn("Cannot seek, duration invalid:", duration)
    }
  }
  const skipTime = (seconds: number) => {
    if (playerRef.current && duration > 0) {
      const newTime = Math.max(0, Math.min(currentTime + seconds, duration))
      console.log("skipTime: newTime=", newTime)
      playerRef.current.seekTo(newTime)
    }
  }
  const toggleMute = () => setIsMuted(!isMuted)
  const toggleFullscreen = () => {
    const elem = document.getElementById('video-container')
    if (elem) {
      if (!document.fullscreenElement) {
        elem.requestFullscreen()
      } else {
        document.exitFullscreen()
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Notes functionality
  const loadNotes = React.useCallback(() => {
    if (currentCourseId && lessonId) {
      const storedNotes = localStorage.getItem(`lesson_notes_${currentCourseId}_${lessonId}`)
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes))
      }
    }
  }, [currentCourseId, lessonId])

  const saveNotes = React.useCallback((updatedNotes: typeof notes) => {
    if (currentCourseId && lessonId) {
      localStorage.setItem(`lesson_notes_${currentCourseId}_${lessonId}`, JSON.stringify(updatedNotes))
    }
  }, [currentCourseId, lessonId])

  const addNote = () => {
    if (currentNote.trim()) {
      const newNote = {
        id: Date.now().toString(),
        timestamp: currentTime,
        content: currentNote.trim()
      }
      const updatedNotes = [...notes, newNote].sort((a, b) => a.timestamp - b.timestamp)
      setNotes(updatedNotes)
      saveNotes(updatedNotes)
      setCurrentNote('')
      toast.success('Note added!')
    }
  }

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id)
    setNotes(updatedNotes)
    saveNotes(updatedNotes)
    toast.success('Note deleted')
  }

  const jumpToNote = (timestamp: number) => {
    handleSeek(timestamp)
    setIsPlaying(true)
  }

  // Load notes on mount
  React.useEffect(() => {
    loadNotes()
  }, [loadNotes])
  // Sample checkpoints disabled

  // Check for checkpoint triggers during playback
  React.useEffect(() => {
    if (!isPlaying || activeCheckpoint || checkpoints.length === 0) return

    const currentCheckpoint = checkpoints.find(
      cp => Math.abs(currentTime - cp.timestamp) < 0.5 && currentTime >= cp.timestamp
    )

    if (currentCheckpoint) {
      setActiveCheckpoint(currentCheckpoint)
      setIsPlaying(false)
      setSelectedAnswer(null)
      setCheckpointAnswered(false)
    }
  }, [currentTime, checkpoints, activeCheckpoint, isPlaying])

  const handleCheckpointAnswer = () => {
    if (selectedAnswer === null) return
    setCheckpointAnswered(true)
  }

  const closeCheckpoint = () => {
    setActiveCheckpoint(null)
    setSelectedAnswer(null)
    setCheckpointAnswered(false)
    setIsPlaying(true)
  }

  // Speed indicator animation
  const showSpeedChange = (newSpeed: number) => {
    setPlaybackRate(newSpeed)
    setShowSpeedIndicator(true)
    setTimeout(() => setShowSpeedIndicator(false), 1000)
  }

  // Add reaction animation
  const addReaction = (emoji: string) => {
    const rect = videoContainerRef.current?.getBoundingClientRect()
    if (!rect) return

    const newReaction = {
      id: Date.now().toString(),
      emoji,
      x: Math.random() * (rect.width - 50),
      y: rect.height - 100
    }

    setReactions(prev => [...prev, newReaction])
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id))
    }, 2000)
  }

  // Focus mode toggle
  const toggleFocusMode = () => {
    setFocusMode(!focusMode)
    if (!focusMode) {
      toast.success('Focus Mode Activated', { icon: '🎯' })
    }
  }

  // Show achievement
  const showAchievementNotification = (title: string, description: string, icon: string) => {
    setShowAchievement({ title, description, icon })
    celebrationAnimation()
    setTimeout(() => setShowAchievement(null), 4000)
  }

  // Study assistant suggestions
  const getStudyTip = () => {
    const tips = [
      "Take a 5-minute break every 25 minutes for better retention! 🧠",
      "Try teaching this concept to someone - it's the best way to learn! 💡",
      "Review your notes within 24 hours to boost memory retention by 60%! 📝",
      "Stay hydrated! Your brain is 73% water and needs it to function optimally! 💧",
      "The Feynman Technique: Explain this concept in simple terms to master it! 🎓",
    ]
    return tips[Math.floor(Math.random() * tips.length)]
  }

  const toggleStudyAssistant = () => {
    if (!showStudyAssistant) {
      setAssistantMessage(getStudyTip())
    }
    setShowStudyAssistant(!showStudyAssistant)
  }

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault()
          handlePlayPause()
          break
        case 'j':
          e.preventDefault()
          skipTime(-10)
          break
        case 'l':
          e.preventDefault()
          skipTime(10)
          break
        case 'arrowleft':
          e.preventDefault()
          skipTime(-5)
          break
        case 'arrowright':
          e.preventDefault()
          skipTime(5)
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'p':
          e.preventDefault()
          const videoElement = document.querySelector('video')
          if (videoElement && document.pictureInPictureEnabled) {
            if (document.pictureInPictureElement) {
              document.exitPictureInPicture()
              setIsPiPMode(false)
            } else {
              videoElement.requestPictureInPicture()
              setIsPiPMode(true)
            }
          }
          break
        case 'n':
          e.preventDefault()
          setShowNotesPanel(true)
          break
        case '?':
          e.preventDefault()
          setShowKeyboardShortcuts(true)
          break
        case 'escape':
          if (showKeyboardShortcuts) {
            setShowKeyboardShortcuts(false)
          }
          break
        default:
          // Number keys 0-9 for seeking
          if (e.key >= '0' && e.key <= '9') {
            e.preventDefault()
            const percentage = parseInt(e.key) * 10
            const seekTime = (percentage / 100) * duration
            handleSeek(seekTime)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, duration, currentTime, showKeyboardShortcuts])

  // Close quality selector and theme switcher when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element

      // Close quality selector
      if (showQualitySelector && !target.closest('#quality-selector')) {
        setShowQualitySelector(false)
      }

      // Close theme switcher
      if (showThemeSwitcher && !target.closest('#theme-switcher')) {
        setShowThemeSwitcher(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showQualitySelector, showThemeSwitcher])

  
  
  // Ambient lighting effect
  React.useEffect(() => {
    if (!ambientLighting || !videoContainerRef.current) return

    const updateAmbientColor = () => {
      const video = videoContainerRef.current?.querySelector('video')
      if (!video) return

      // Create canvas to sample video colors
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = 50
      canvas.height = 50

      try {
        ctx.drawImage(video, 0, 0, 50, 50)
        const imageData = ctx.getImageData(0, 0, 50, 50).data

        let r = 0, g = 0, b = 0
        const len = imageData.length

        for (let i = 0; i < len; i += 4) {
          r += imageData[i]
          g += imageData[i + 1]
          b += imageData[i + 2]
        }

        r = Math.floor(r / (len / 4))
        g = Math.floor(g / (len / 4))
        b = Math.floor(b / (len / 4))

        document.body.style.background = `radial-gradient(circle at 50% 50%, rgba(${r},${g},${b},0.15) 0%, rgba(0,0,0,1) 70%)`
      } catch (e) {
        // CORS or other error - ignore
      }
    }

    const interval = setInterval(updateAmbientColor, 500)
    return () => {
      clearInterval(interval)
      document.body.style.background = ''
    }
  }, [ambientLighting, isPlaying])

  // Video protection - disable dev tools shortcuts and screen capture
  React.useEffect(() => {
    const preventDevTools = (e: KeyboardEvent) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault()
        toast.error('Developer tools are disabled for content protection')
        return false
      }

      // Prevent Print Screen
      if (e.key === 'PrintScreen') {
        e.preventDefault()
        toast.error('Screenshots are disabled for content protection')
        return false
      }
    }

    // Disable right-click on video
    const videoContainer = document.getElementById('video-container')
    const preventContextMenu = (e: Event) => {
      e.preventDefault()
      return false
    }

    document.addEventListener('keydown', preventDevTools)
    if (videoContainer) {
      videoContainer.addEventListener('contextmenu', preventContextMenu)
    }

    return () => {
      document.removeEventListener('keydown', preventDevTools)
      if (videoContainer) {
        videoContainer.removeEventListener('contextmenu', preventContextMenu)
      }
    }
  }, [])

  const handleMarkComplete = async () => {
    if (!lesson?.id || !currentCourseId) {
      toast.error('Unable to mark lesson as complete')
      return
    }

    try {
      const response = await api.post(`/courses/${currentCourseId}/lessons/${lesson.id}/complete`)

      toast.success('Lesson marked as complete!')
      await fetchCourse()

      if (response.data.course_completed && response.data.certificate_available) {
        toast.success('🎉 Congratulations! Course completed!')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to mark lesson as complete')
    }
  }

  const navigateToLesson = (contentIdOrLessonId: string | number, lessonType?: string) => {
    setShowAutoAdvance(false)
    setAutoAdvanceCountdown(5)
    if (autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current)
    }
    // Close sidebar on mobile after selecting a lesson
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
    // All content types (lessons, quizzes, assignments) now use the same route for inline rendering
    // Use contentId if it's a string (e.g., "quiz-1"), otherwise construct it from type and ID
    let contentId: string
    if (typeof contentIdOrLessonId === 'string') {
      contentId = contentIdOrLessonId
    } else {
      contentId = lessonType ? `${lessonType}-${contentIdOrLessonId}` : `lesson-${contentIdOrLessonId}`
    }
    // Save scroll position right before navigation
    if (sidebarRef.current) {
      sidebarScrollPos.current = sidebarRef.current.scrollTop
    }
    navigate(`/courses/${currentCourseId}/lessons/${contentId}`)
  }

  const handleNextLesson = () => {
    if (!course || !course.lessons || !lessonId) return

    const currentIndex = course.lessons.findIndex((l: any) => l.contentId === lessonId)
    if (currentIndex === -1 || currentIndex >= course.lessons.length - 1) {
      toast.success('You have completed all content in this course!')
      return
    }

    const nextLesson = course.lessons[currentIndex + 1]
    navigateToLesson(nextLesson.contentId)
  }

  const startAutoAdvance = () => {
    if (!course || !course.lessons || !lessonId) return

    const currentIndex = course.lessons.findIndex((l: any) => l.contentId === lessonId)
    if (currentIndex === -1 || currentIndex >= course.lessons.length - 1) return // No next lesson

    setShowAutoAdvance(true)
    setAutoAdvanceCountdown(5)

    let countdown = 5
    autoAdvanceTimerRef.current = setInterval(() => {
      countdown -= 1

      if (countdown <= 0) {
        // Time's up, go to next lesson
        if (autoAdvanceTimerRef.current) {
          clearInterval(autoAdvanceTimerRef.current)
        }
        setShowAutoAdvance(false)

        // Navigate in next tick to avoid setState during render
        setTimeout(() => {
          const nextLesson = course.lessons[currentIndex + 1]
          navigate(`/courses/${currentCourseId}/lessons/${nextLesson.contentId}`)
        }, 0)
      } else {
        setAutoAdvanceCountdown(countdown)
      }
    }, 1000)
  }

  const cancelAutoAdvance = () => {
    setShowAutoAdvance(false)
    setAutoAdvanceCountdown(5)
    if (autoAdvanceTimerRef.current) {
      clearInterval(autoAdvanceTimerRef.current)
    }
  }

  const handleVideoEnd = async () => {
    setIsPlaying(false)

    // Mark lesson as complete
    if (lesson?.id && currentCourseId) {
      try {
        const response = await api.post(`/courses/${currentCourseId}/lessons/${lesson.id}/complete`)

        console.log('Lesson marked as complete:', response.data)
        await fetchCourse()

        if (response.data.course_completed && response.data.certificate_available) {
          toast.success('🎉 Congratulations! Course completed!')
        } else {
          toast.success('Lesson completed!')
        }
      } catch (error: any) {
        console.error('Error marking lesson as complete:', error)
      }
    }

    // Start auto-advance timer
    startAutoAdvance()
  }

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center text-neutral-300">
          <h2 className="text-2xl font-bold mb-2">No Lessons Available</h2>
          <p className="text-neutral-500 mb-4">This course doesn't have any lessons yet.</p>
          <Button onClick={() => navigate(`/courses/${currentCourseId}`)}>
            Back to Course
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex flex-col lg:flex-row">
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-neutral-800 hover:bg-neutral-700 text-white p-3 rounded-lg shadow-lg transition-all"
        aria-label="Toggle menu"
      >
        <List className="w-5 h-5" />
      </button>

      {/* Certificate Available Banner */}
      {certificateAvailable && showCertificateBanner && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-3 sm:py-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-2 rounded-full">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">🎉 Congratulations!</h3>
                <p className="text-sm text-white/90">Your certificate is ready! All assignments have been graded.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate(`/certificates/${currentCourseId}`)}
                className="bg-white text-green-600 hover:bg-white/90 font-semibold"
              >
                View Certificate
              </Button>
              <button
                onClick={() => setShowCertificateBanner(false)}
                className="text-white/80 hover:text-white p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar with Gradient */}
      <aside
        className={cn(
          "w-80 bg-gradient-to-b from-neutral-800 to-neutral-900 border-r border-primary-900/30 flex flex-col transition-all duration-300 shadow-2xl",
          "fixed lg:sticky lg:top-0 h-screen z-40 lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Enhanced Sidebar Header */}
        <div className="p-4 border-b border-primary-900/30 bg-gradient-to-r from-neutral-800 to-neutral-700">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/courses/${currentCourseId}`)}
              className="text-neutral-300 hover:text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-neutral-400 hover:text-white hover:bg-white/10 lg:hidden"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <h2 className="font-bold text-white text-lg truncate bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
            {course.title}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-neutral-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-600 to-primary-500 transition-all duration-500"
                style={{ width: `${courseProgress || (course.lessons?.filter((l: any) => l.is_completed).length / (course.lessons?.length || 1)) * 100}%` }}
              />
            </div>
            <span className="text-xs text-neutral-400 font-medium">
              {courseProgress}%
            </span>
          </div>
        </div>

        {/* Enhanced Lessons List with Sections */}
        <div ref={sidebarRef} className="flex-1 overflow-y-auto custom-scrollbar">
          {(course.sections || [{ id: 'default', title: '', lessons: course.lessons || [] }]).map((section: any) => (
            <div key={section.id}>
              {section.title && (
                <div className="px-4 py-2 bg-neutral-900/60 border-b border-neutral-700/50">
                  <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider">{section.title}</p>
                  {section.description && <p className="text-xs text-neutral-500 mt-0.5">{section.description}</p>}
                </div>
              )}
              {section.lessons?.map((l: any, index: number) => {
            const isCurrent = l.contentId === lessonId
            return (
              <button
                key={l.contentId}
                onClick={() => navigateToLesson(l.contentId)}
                ref={isCurrent ? activeItemRef : null}
                className={cn(
                  "w-full p-4 text-left border-b border-neutral-700/50 hover:bg-gradient-to-r hover:from-neutral-700/70 hover:to-neutral-700/30 transition-all duration-300 group relative",
                  isCurrent && "bg-gradient-to-r from-primary-900/40 to-neutral-700 border-l-4 border-primary-500 shadow-lg"
                )}
              >
                {/* Active indicator glow */}
                {isCurrent && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-transparent pointer-events-none" />
                )}

                <div className="flex items-start gap-3 relative z-10">
                  <div className="flex-shrink-0 mt-1">
                    {l.is_completed ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-success-600 to-success-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-lg animate-pulse">
                        {l.type === 'quiz' ? (
                          <HelpCircle className="w-4 h-4 text-white" />
                        ) : l.type === 'assignment' ? (
                          <PenTool className="w-4 h-4 text-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white" />
                        )}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-neutral-600 flex items-center justify-center text-neutral-500 group-hover:border-primary-500 group-hover:text-primary-400 transition-all">
                        {l.type === 'quiz' ? (
                          <HelpCircle className="w-4 h-4" />
                        ) : l.type === 'assignment' ? (
                          <PenTool className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-bold">{index + 1}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "text-xs font-medium mb-1",
                      isCurrent ? "text-primary-400" : "text-neutral-500 group-hover:text-neutral-400"
                    )}>
                      {l.type === 'quiz' ? 'Quiz' : l.type === 'assignment' ? 'Assignment' : `Lesson ${index + 1}`}
                    </div>
                    <div className={cn(
                      "font-semibold truncate transition-colors",
                      isCurrent ? "text-white" : "text-neutral-300 group-hover:text-white"
                    )}>
                      {l.lesson_title || l.title}
                    </div>
                    {l.lesson_duration && (
                      <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {l.lesson_duration}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
            </div>
          ))}
        </div>

        {/* Mark Complete Button */}
        <div className="p-4 border-t border-neutral-700">
          <Button
            onClick={handleMarkComplete}
            disabled={lesson.is_completed}
            className="w-full"
          >
            {lesson.is_completed ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Completed
              </>
            ) : (
              "Mark as Complete"
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full lg:w-auto overflow-hidden">
        {/* Video Container */}
        <div
          ref={videoContainerRef}
          id="video-container"
          className={cn(
            "relative bg-black w-full aspect-video lg:aspect-auto lg:flex-1 transition-all duration-500",
            focusMode && "scale-105"
          )}
          onMouseMove={() => setShowControls(true)}
          onMouseLeave={() => isPlaying && setShowControls(false)}
          onContextMenu={(e) => {
            e.preventDefault()
            toast.error('Video download is disabled for content protection')
            return false
          }}
        >
          {/* Render based on content type */}
          {lesson.type === 'quiz' ? (
            <QuizRenderer quizId={lesson.id} courseId={parseInt(currentCourseId!)} onNext={handleNextLesson} />
          ) : lesson.type === 'assignment' ? (
            <AssignmentRenderer assignmentId={lesson.id} courseId={parseInt(currentCourseId!)} onNext={handleNextLesson} />
          ) : (
            <VideoPlayer
              ref={playerRef}
              src={lesson.video_url || lesson.youtube_url || ''}
              title={lesson.title}
              duration={lesson.video_duration}
              poster={lesson.thumbnail}
              autoPlay={false}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={handleVideoEnd}
              onTimeUpdate={(state) => handleProgress(state)}
              onDuration={handleDuration}
              lessonId={lesson.id}
              courseId={parseInt(currentCourseId!)}
            />
          )}

          {/* Video-specific overlays - Only show for video lessons */}
          {lesson.type !== 'quiz' && lesson.type !== 'assignment' && (
            <>
              {/* Video Protection Overlay */}
              <div
                className="absolute inset-0 pointer-events-none select-none"
                style={{ zIndex: 1 }}
                onContextMenu={(e) => e.preventDefault()}
              />

              {/* Protection Badge */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-white font-medium">Protected Content</span>
                </div>
              </div>

              {/* Gamification Stats */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                {/* Additional stats can be added here if needed */}
              </div>

              {/* Reactions Overlay */}
              {reactions.map(reaction => (
                <div
                  key={reaction.id}
                  className="absolute pointer-events-none z-20 animate-float-up"
                  style={{
                    left: `${reaction.x}px`,
                    bottom: `${reaction.y}px`,
                    animation: 'floatUp 2s ease-out forwards'
                  }}
                >
                  <span className="text-4xl drop-shadow-2xl">{reaction.emoji}</span>
                </div>
              ))}

              {/* Reaction Bar */}
              {showReactions && (
                <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30">
                  <div className="bg-black/80 backdrop-blur-xl rounded-full px-4 py-3 border border-white/20 flex items-center gap-3 shadow-2xl">
                    {['❤️', '👍', '🎉', '🔥', '💡', '🤔'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => addReaction(emoji)}
                        className="text-2xl hover:scale-125 transition-transform active:scale-95 pointer-events-auto"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Assistant Panel */}
              {showStudyAssistant && (
                <div className="absolute top-20 right-4 z-30 max-w-sm pointer-events-auto">
                  <div className="bg-gradient-to-br from-primary-900/90 to-neutral-900/90 backdrop-blur-xl rounded-xl p-4 border border-primary-500/30 shadow-2xl">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-sm mb-1">Study Assistant</h3>
                        <p className="text-neutral-300 text-xs leading-relaxed">{assistantMessage}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowStudyAssistant(false)}
                        className="text-white/60 hover:text-white hover:bg-white/10 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={() => setAssistantMessage(getStudyTip())}
                      size="sm"
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white text-xs"
                    >
                      <Lightbulb className="w-3 h-3 mr-2" />
                      Get Another Tip
                    </Button>
                  </div>
                </div>
              )}

              {/* Achievement Notification */}
              {showAchievement && (
                <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce-in">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 border-4 border-yellow-300 shadow-2xl min-w-[300px]">
                    <div className="text-center">
                      <div className="text-6xl mb-4">{showAchievement.icon}</div>
                      <h2 className="text-2xl font-black text-white mb-2">{showAchievement.title}</h2>
                      <p className="text-white/90 font-medium">{showAchievement.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Video controls are now built into the VideoPlayer component */}

          {/* Auto-Advance Modal */}
          {showAutoAdvance && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
              <div className="bg-neutral-800 rounded-lg p-8 max-w-md mx-4 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {autoAdvanceCountdown}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Next Lesson Starting...</h3>
                  <p className="text-neutral-400">
                    The next lesson will start automatically in {autoAdvanceCountdown} seconds
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={cancelAutoAdvance}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (autoAdvanceTimerRef.current) {
                        clearInterval(autoAdvanceTimerRef.current)
                      }
                      const currentIndex = course.lessons.findIndex((l: any) => l.id === parseInt(lessonId!))
                      const nextLesson = course.lessons[currentIndex + 1]
                      navigate(`/courses/${currentCourseId}/lessons/${nextLesson.id}`)
                      setShowAutoAdvance(false)
                    }}
                    className="flex-1"
                  >
                    Go Now
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Speed Indicator Overlay */}
          {showSpeedIndicator && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
              <div className="bg-black/80 backdrop-blur-md rounded-2xl px-8 py-6 border-2 border-primary-500 shadow-2xl shadow-primary-500/50 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-4">
                  <Gauge className="w-10 h-10 text-primary-500" />
                  <div className="text-white">
                    <div className="text-3xl font-bold">{playbackRate}x</div>
                    <div className="text-sm text-neutral-400">Playback Speed</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts Modal */}
          {showKeyboardShortcuts && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
              <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl p-8 max-w-2xl mx-4 border border-primary-900/30 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Keyboard className="w-7 h-7 text-primary-500" />
                    Keyboard Shortcuts
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowKeyboardShortcuts(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/30">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Play/Pause</span>
                      <kbd className="px-3 py-1.5 bg-neutral-900 rounded border border-neutral-600 text-white font-mono text-sm">Space</kbd>
                    </div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/30">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Skip Back 10s</span>
                      <kbd className="px-3 py-1.5 bg-neutral-900 rounded border border-neutral-600 text-white font-mono text-sm">J</kbd>
                    </div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/30">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Skip Forward 10s</span>
                      <kbd className="px-3 py-1.5 bg-neutral-900 rounded border border-neutral-600 text-white font-mono text-sm">L</kbd>
                    </div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/30">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Mute/Unmute</span>
                      <kbd className="px-3 py-1.5 bg-neutral-900 rounded border border-neutral-600 text-white font-mono text-sm">M</kbd>
                    </div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/30">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Fullscreen</span>
                      <kbd className="px-3 py-1.5 bg-neutral-900 rounded border border-neutral-600 text-white font-mono text-sm">F</kbd>
                    </div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/30">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Picture-in-Picture</span>
                      <kbd className="px-3 py-1.5 bg-neutral-900 rounded border border-neutral-600 text-white font-mono text-sm">P</kbd>
                    </div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/30">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Seek (0-90%)</span>
                      <kbd className="px-3 py-1.5 bg-neutral-900 rounded border border-neutral-600 text-white font-mono text-sm">0-9</kbd>
                    </div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/30">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Skip Back 5s</span>
                      <kbd className="px-3 py-1.5 bg-neutral-900 rounded border border-neutral-600 text-white font-mono text-sm">←</kbd>
                    </div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/30">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Skip Forward 5s</span>
                      <kbd className="px-3 py-1.5 bg-neutral-900 rounded border border-neutral-600 text-white font-mono text-sm">→</kbd>
                    </div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/30">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Add Note</span>
                      <kbd className="px-3 py-1.5 bg-neutral-900 rounded border border-neutral-600 text-white font-mono text-sm">N</kbd>
                    </div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-4 border border-neutral-600/30">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300">Show Shortcuts</span>
                      <kbd className="px-3 py-1.5 bg-neutral-900 rounded border border-neutral-600 text-white font-mono text-sm">?</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Checkpoint Quiz Modal */}
          {activeCheckpoint && (
            <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl p-8 max-w-2xl mx-4 border-2 border-primary-600/30 shadow-2xl">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Quick Check!</h3>
                      <p className="text-sm text-neutral-400">Test your understanding</p>
                    </div>
                  </div>
                  <p className="text-lg text-white mb-6">{activeCheckpoint.question}</p>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-6">
                  {activeCheckpoint.options.map((option: string, index: number) => {
                    const isSelected = selectedAnswer === index
                    const isCorrect = index === activeCheckpoint.correctAnswer
                    const showResult = checkpointAnswered

                    return (
                      <button
                        key={index}
                        onClick={() => !checkpointAnswered && setSelectedAnswer(index)}
                        disabled={checkpointAnswered}
                        className={cn(
                          "w-full p-4 rounded-lg border-2 text-left transition-all font-medium",
                          !showResult && !isSelected && "border-neutral-600 bg-neutral-700/30 hover:border-primary-500 hover:bg-neutral-700/50 text-white",
                          !showResult && isSelected && "border-primary-500 bg-primary-600/20 text-white",
                          showResult && isCorrect && "border-green-500 bg-green-500/20 text-green-300",
                          showResult && !isCorrect && isSelected && "border-red-500 bg-red-500/20 text-red-300",
                          showResult && !isCorrect && !isSelected && "border-neutral-600 bg-neutral-700/30 text-neutral-500"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showResult && isCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          )}
                          {showResult && !isCorrect && isSelected && (
                            <X className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Explanation (after answering) */}
                {checkpointAnswered && (
                  <div className={cn(
                    "p-4 rounded-lg border-2 mb-6",
                    selectedAnswer === activeCheckpoint.correctAnswer
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-yellow-500/30 bg-yellow-500/10"
                  )}>
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        selectedAnswer === activeCheckpoint.correctAnswer
                          ? "bg-green-500/20"
                          : "bg-yellow-500/20"
                      )}>
                        {selectedAnswer === activeCheckpoint.correctAnswer ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <h4 className={cn(
                          "font-bold mb-1",
                          selectedAnswer === activeCheckpoint.correctAnswer
                            ? "text-green-300"
                            : "text-yellow-300"
                        )}>
                          {selectedAnswer === activeCheckpoint.correctAnswer
                            ? "Correct!"
                            : "Not quite right"}
                        </h4>
                        <p className="text-sm text-neutral-300">{activeCheckpoint.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  {!checkpointAnswered ? (
                    <>
                      <Button
                        onClick={closeCheckpoint}
                        variant="outline"
                        className="flex-1"
                      >
                        Skip
                      </Button>
                      <Button
                        onClick={handleCheckpointAnswer}
                        disabled={selectedAnswer === null}
                        className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Answer
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={closeCheckpoint}
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                    >
                      Continue Learning
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lesson Info Bar */}
        <div className="bg-neutral-800 border-t border-neutral-700 p-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-white mb-2">{lesson.title}</h2>
            <div
              className="text-neutral-400 text-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.description }}
            />
            {lesson.attachment_url && (() => {
              let files: string[] = []
              try { files = JSON.parse(lesson.attachment_url) } catch { files = lesson.attachment_url ? [lesson.attachment_url] : [] }
              return files.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {files.map((url: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const fileUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`
                        window.location.href = fileUrl
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      📎 Download File {idx + 1}
                    </button>
                  ))}
                </div>
              ) : null
            })()}
          </div>
        </div>

        {/* Notes Panel */}
        {showNotesPanel && (
          <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border-t border-primary-900/30 p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <StickyNote className="w-6 h-6 text-primary-500" />
                  My Notes
                  <span className="text-sm font-normal text-neutral-400">({notes.length})</span>
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotesPanel(false)}
                  className="text-neutral-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Add Note Form */}
              <div className="bg-neutral-700/30 rounded-lg p-4 mb-6 border border-neutral-600/30">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={currentNote}
                    onChange={(e) => setCurrentNote(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addNote()}
                    placeholder="Add a note at the current timestamp..."
                    className="flex-1 bg-neutral-900 text-white px-4 py-2 rounded-lg border border-neutral-600 focus:border-primary-500 focus:outline-none transition-colors"
                  />
                  <Button
                    onClick={addNote}
                    disabled={!currentNote.trim()}
                    className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                </div>
                <div className="mt-2 text-sm text-neutral-400 flex items-center gap-2">
                  <span className="text-primary-500 font-mono">{formatTime(currentTime)}</span>
                  <span>Current timestamp</span>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notes.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500">
                    <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No notes yet. Add your first note!</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-neutral-700/50 rounded-lg p-4 border border-neutral-600/30 hover:border-primary-600/50 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => jumpToNote(note.timestamp)}
                          className="flex-shrink-0 px-3 py-1.5 bg-primary-900/40 hover:bg-primary-600 text-primary-300 hover:text-white rounded-md font-mono text-sm transition-all group-hover:scale-105"
                        >
                          {formatTime(note.timestamp)}
                        </button>
                        <p className="flex-1 text-neutral-200 text-sm leading-relaxed">{note.content}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNote(note.id)}
                          className="flex-shrink-0 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

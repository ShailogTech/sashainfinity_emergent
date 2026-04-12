import * as React from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Lock,
  FileText,
  Download,
  MessageSquare,
  BookOpen,
  Clock,
  Award,
  Eye,
  Plus,
  Trash2,
  PanelRightOpen,
  PanelRightClose,
  Sparkles,
  Zap,
  TrendingUp,
  Target,
  HelpCircle,
  PenTool,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import * as Tabs from "@radix-ui/react-tabs"
import * as Accordion from "@radix-ui/react-accordion"
import ReactPlayer from "react-player"
import { cn } from "@/utils/cn"
import { api } from "@/api/axios"
import { certificatesAPI } from "@/api/certificates"
import toast from "react-hot-toast"
import { getBackendUrl, getCertificateUrl } from "@/config/urls"

// NOTE: This file appears to be unused. The app uses lesson-redesigned.tsx instead.
// Keeping this file updated for consistency, but consider removing if confirmed unused.

export const LessonPage = () => {
  const { courseId, lessonId, id } = useParams<{ courseId?: string; lessonId?: string; id?: string }>()
  const navigate = useNavigate()

  // Use id if it exists (from /courses/:id/learn), otherwise use courseId
  const currentCourseId = id || courseId

  const [lesson, setLesson] = React.useState<any>(null)
  const [course, setCourse] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [showCertificateModal, setShowCertificateModal] = React.useState(false)
  const [certificateUrl, setCertificateUrl] = React.useState<string | null>(null)
  const [certificateId, setCertificateId] = React.useState<number | null>(null)

  const fetchCourse = React.useCallback(async () => {
      try {
        setLoading(true)
        // Use axios which handles authentication automatically
        const api = (await import('@/api/axios')).api

        // Use id if it exists (from /courses/:id/learn), otherwise use courseId
        const currentCourseId = id || courseId

        if (!currentCourseId) {
          console.error('No course ID provided')
          return
        }

        // Fetch course data
        const courseResponse = await api.get(`/courses/${currentCourseId}`)
        const courseData = courseResponse.data

        // Combine lessons, quizzes, and assignments into course content
        const allContent = [
          ...(courseData.lessons || []).map((l: any) => ({ ...l, type: 'lesson' })),
          ...(courseData.quizzes || []).map((q: any) => ({ ...q, type: 'quiz', lesson_title: q.title })),
          ...(courseData.assignments || []).map((a: any) => ({ ...a, type: 'assignment', lesson_title: a.title }))
        ]

        // Sort by creation date to maintain chronological order
        allContent.sort((a, b) => {
          const dateA = new Date(a.created_at || a.post_date || 0).getTime()
          const dateB = new Date(b.created_at || b.post_date || 0).getTime()
          return dateA - dateB
        })

        setCourse({
          id: courseData.id,
          title: courseData.title,
          lessons: allContent
        })

        // If no specific lesson ID, redirect to the first content item with proper URL
        if (!lessonId && allContent.length > 0) {
          const firstContent = allContent[0]
          // Redirect to proper URL based on content type
          if (firstContent.type === 'quiz') {
            navigate(`/quiz/${firstContent.id}`, { replace: true })
          } else if (firstContent.type === 'assignment') {
            navigate(`/assignment/${firstContent.id}`, { replace: true })
          } else {
            navigate(`/courses/${currentCourseId}/lessons/${firstContent.id}`, { replace: true })
          }
          return
        }

        // If we have a lessonId, load that specific content item
        if (lessonId && allContent.length > 0) {
          // Handle both numeric IDs and prefixed IDs (e.g., "assignment-3", "quiz-5")
          let currentLesson = allContent.find((l: any) => l.id === parseInt(lessonId))

          // If not found by numeric ID, try to extract the numeric part and search again
          if (!currentLesson && lessonId.includes('-')) {
            const numericPart = lessonId.split('-').pop()
            currentLesson = allContent.find((l: any) => l.id === parseInt(numericPart || ''))
          }

          if (currentLesson) {
            console.log('Found lesson:', currentLesson)
            console.log('Lesson type:', currentLesson.type)

            // Check if this is actually a quiz or assignment
            if (currentLesson.type === 'quiz') {
              // Redirect to quiz page
              console.log('Redirecting to quiz page:', currentLesson.id)
              navigate(`/quiz/${currentLesson.id}`, { replace: true })
              return
            } else if (currentLesson.type === 'assignment') {
              // Redirect to assignment page
              console.log('Redirecting to assignment page:', currentLesson.id)
              navigate(`/assignment/${currentLesson.id}`, { replace: true })
              return
            }

            const videoUrl = currentLesson.lesson_video || ''
            const fullVideoUrl = videoUrl.startsWith('/') ? getBackendUrl(videoUrl) : videoUrl

            // Load saved notes from localStorage
            const savedNotesKey = `lesson_notes_${currentCourseId}_${lessonId}`
            const savedNotes = localStorage.getItem(savedNotesKey)
            const notes = savedNotes ? JSON.parse(savedNotes) : []

            // If it's an assignment, fetch full assignment details including attachments
            let attachments = []
            let fullContent = currentLesson.lesson_content || '<p>Lesson content will be available soon.</p>'
            let description = currentLesson.lesson_content || 'No description available'

            if (currentLesson.type === 'assignment') {
              try {
                // Extract numeric ID from lessonId (could be "assignment-3" or "3")
                const numericId = lessonId?.replace(/^assignment-/, '') || currentLesson.id
                console.log('Fetching assignment details for ID:', numericId)
                const assignmentResponse = await api.get(`/courses/${currentCourseId}/assignments/${numericId}`)
                const assignmentData = assignmentResponse.data
                console.log('Assignment data received:', assignmentData)
                attachments = assignmentData.attachments || []
                console.log('Attachments:', attachments)
                fullContent = assignmentData.instructions || assignmentData.description || '<p>No instructions provided.</p>'
                description = assignmentData.description || 'No description available'
              } catch (error) {
                console.error('Error fetching assignment details:', error)
              }
            }

            setLesson({
              id: currentLesson.id,
              title: currentLesson.lesson_title || currentLesson.title,
              description: description,
              content: fullContent,
              video_url: fullVideoUrl,
              video_duration: currentLesson.lesson_duration || currentLesson.duration || 0,
              attachments: attachments,
              notes: notes,
              is_completed: false,
              is_preview: currentLesson.is_preview || false,
              type: currentLesson.type || 'lesson'
            })
          }
        }
      } catch (error) {
        console.error('Error fetching course/lesson data:', error)
      } finally {
        setLoading(false)
      }
  }, [courseId, lessonId, id, navigate])

  React.useEffect(() => {
    fetchCourse()
  }, [fetchCourse])

  // Smart Resume: Load saved progress when lesson loads
  React.useEffect(() => {
    if (lessonId && currentCourseId) {
      const savedKey = `lesson_progress_${currentCourseId}_${lessonId}`
      const saved = localStorage.getItem(savedKey)
      if (saved) {
        const savedTime = parseFloat(saved)
        setSavedProgress(savedTime)
      }
    }
  }, [lessonId, currentCourseId])

  // Smart Resume: Resume from saved position when player is ready
  React.useEffect(() => {
    if (savedProgress > 5 && !hasResumed && playerRef.current && duration > 0) {
      // Only resume if more than 5 seconds into video
      playerRef.current.seekTo(savedProgress, 'seconds')
      setHasResumed(true)
      toast.success(`Resumed from ${formatTime(savedProgress)}`)
    }
  }, [savedProgress, hasResumed, duration])

  // Smart Resume: Save progress periodically
  React.useEffect(() => {
    if (currentTime > 0 && lessonId && currentCourseId) {
      if (progressSaveTimerRef.current) {
        clearTimeout(progressSaveTimerRef.current)
      }

      progressSaveTimerRef.current = setTimeout(() => {
        const savedKey = `lesson_progress_${currentCourseId}_${lessonId}`
        localStorage.setItem(savedKey, currentTime.toString())
      }, 2000) // Save every 2 seconds of watching
    }

    return () => {
      if (progressSaveTimerRef.current) {
        clearTimeout(progressSaveTimerRef.current)
      }
    }
  }, [currentTime, lessonId, currentCourseId])

  // Video player state
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [volume, setVolume] = React.useState(1)
  const [isMuted, setIsMuted] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [playbackRate, setPlaybackRate] = React.useState(1)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [quality, setQuality] = React.useState<string>("auto")
  const [isBuffering, setIsBuffering] = React.useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = React.useState(false)
  const [showAutoplayCountdown, setShowAutoplayCountdown] = React.useState(false)
  const [autoplayCountdown, setAutoplayCountdown] = React.useState(5)
  const [hasResumed, setHasResumed] = React.useState(false)
  const [savedProgress, setSavedProgress] = React.useState<number>(0)

  // UI state
  const [showControls, setShowControls] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState("overview")
  const [userNotes, setUserNotes] = React.useState("")
  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(() => {
    // Load sidebar state from localStorage
    const saved = localStorage.getItem('lesson_sidebar_expanded')
    return saved === null ? true : saved === 'true'
  })

  const playerRef = React.useRef<ReactPlayer>(null)
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout>()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const autoplayTimerRef = React.useRef<NodeJS.Timeout>()
  const progressSaveTimerRef = React.useRef<NodeJS.Timeout>()

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return
      }

      console.log('Key pressed:', e.key, 'Target:', e.target)

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault()
          console.log('Play/Pause triggered')
          setIsPlaying(!isPlaying)
          break
        case 'arrowleft':
        case 'j':
          e.preventDefault()
          console.log('Skip back -10s triggered')
          skipTime(-10)
          break
        case 'arrowright':
        case 'l':
          e.preventDefault()
          console.log('Skip forward +10s triggered')
          skipTime(10)
          break
        case 'arrowup':
          e.preventDefault()
          handleVolumeChange(Math.min(1, volume + 0.1))
          break
        case 'arrowdown':
          e.preventDefault()
          handleVolumeChange(Math.max(0, volume - 0.1))
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'f':
          e.preventDefault()
          if (containerRef.current) {
            if (!document.fullscreenElement) {
              containerRef.current.requestFullscreen()
              setIsFullscreen(true)
            } else {
              document.exitFullscreen()
              setIsFullscreen(false)
            }
          }
          break
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': case '8': case '9':
          e.preventDefault()
          const percent = parseInt(e.key) / 10
          const seekToTime = duration * percent
          console.log(`Number ${e.key} pressed - seeking to ${percent * 100}% (${seekToTime} seconds)`)
          handleSeek(seekToTime)
          break
        case '<':
        case ',':
          e.preventDefault()
          setPlaybackRate(Math.max(0.25, playbackRate - 0.25))
          break
        case '>':
        case '.':
          e.preventDefault()
          setPlaybackRate(Math.min(2, playbackRate + 0.25))
          break
        case '?':
          e.preventDefault()
          setShowKeyboardShortcuts(!showKeyboardShortcuts)
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, volume, isMuted, duration, playbackRate, showKeyboardShortcuts])

  // Auto-hide controls
  React.useEffect(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying, showControls])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    setProgress(state.played * 100)
    setCurrentTime(state.playedSeconds)
  }

  const handleDuration = (duration: number) => {
    setDuration(duration)
  }

  const handleSeek = (seconds: number) => {
    console.log('handleSeek called with:', seconds)
    console.log('playerRef.current:', playerRef.current)
    console.log('duration:', duration)
    if (playerRef.current) {
      // seekTo accepts seconds when 'seconds' type is specified
      console.log('Calling seekTo with seconds:', seconds)
      playerRef.current.seekTo(seconds, 'seconds')
      console.log('seekTo called successfully')
    } else {
      console.error('playerRef.current is null!')
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate)
  }

  const skipTime = (seconds: number) => {
    console.log('skipTime called with:', seconds)
    console.log('currentTime:', currentTime, 'duration:', duration)
    if (playerRef.current) {
      const newTime = Math.max(0, Math.min(currentTime + seconds, duration))
      console.log('Skipping to new time:', newTime)
      playerRef.current.seekTo(newTime, 'seconds')
    } else {
      console.error('playerRef.current is null in skipTime!')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleMarkComplete = async () => {
    if (!lessonId || !currentCourseId) {
      toast.error('Unable to mark lesson as complete')
      return
    }

    try {
      setLoading(true)
      const api = (await import('@/api/axios')).api
      const response = await api.post(`/courses/${currentCourseId}/lessons/${lessonId}/complete`)
      const data = response.data

      console.log('Lesson marked as complete:', data)
      toast.success('Lesson marked as complete!')

      // Reload course data to update UI
      await fetchCourse()

      // Check if course is completed
      if (data.course_completed && data.certificate_available) {
        // Generate certificate automatically
        try {
          const certResponse = await api.post(`/certificates/generate/${currentCourseId}`)
          console.log('Certificate generated:', certResponse.data)

          // Show certificate modal
          setCertificateUrl(certResponse.data.certificate_url)
          setCertificateId(certResponse.data.certificate_id)
          setShowCertificateModal(true)

          toast.success('🎉 Congratulations! Course completed!')
        } catch (certError) {
          console.error('Error generating certificate:', certError)
          toast.success('🎉 Congratulations! Course completed!')
        }
      }
    } catch (error: any) {
      console.error('Error marking lesson as complete:', error)
      toast.error(error.response?.data?.detail || 'Failed to mark lesson as complete')
    } finally {
      setLoading(false)
    }
  }

  const navigateToLesson = (lessonId: number, lessonType?: string) => {
    if (lessonType === 'quiz') {
      navigate(`/quiz/${lessonId}`)
    } else if (lessonType === 'assignment') {
      navigate(`/assignment/${lessonId}`)
    } else {
      navigate(`/courses/${currentCourseId}/lessons/${lessonId}`)
    }
  }

  const goToNextLesson = () => {
    if (!course || !course.lessons || !lessonId) return
    const currentIndex = course.lessons.findIndex((l: any) => l.id === parseInt(lessonId!))
    if (currentIndex < course.lessons.length - 1) {
      const nextLesson = course.lessons[currentIndex + 1]
      navigateToLesson(nextLesson.id, nextLesson.type)
    }
  }

  const goToPreviousLesson = () => {
    if (!course || !course.lessons || !lessonId) return
    const currentIndex = course.lessons.findIndex((l: any) => l.id === parseInt(lessonId!))
    if (currentIndex > 0) {
      const prevLesson = course.lessons[currentIndex - 1]
      navigateToLesson(prevLesson.id, prevLesson.type)
    }
  }

  // Toggle sidebar and persist to localStorage
  const toggleSidebar = () => {
    const newState = !isSidebarExpanded
    setIsSidebarExpanded(newState)
    localStorage.setItem('lesson_sidebar_expanded', String(newState))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading lesson...</p>
        </div>
      </div>
    )
  }

  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h2 className="text-2xl font-bold mb-2">No Lessons Available</h2>
          <p className="text-gray-400 mb-4">This course doesn't have any lessons yet.</p>
          <Button onClick={() => navigate(`/courses/${currentCourseId}`)}>
            Back to Course
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Video Player */}
      <div className={cn(
        "relative bg-black transition-all duration-300",
        !isSidebarExpanded && "mx-auto max-w-7xl"
      )} ref={containerRef}>
        <div
          className="relative aspect-video"
          onMouseMove={() => setShowControls(true)}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          <ReactPlayer
            ref={playerRef}
            url={lesson.video_url || ''}
            width="100%"
            height="100%"
            playing={isPlaying}
            volume={isMuted ? 0 : volume}
            playbackRate={playbackRate}
            onProgress={handleProgress}
            onDuration={handleDuration}
            onBuffer={() => setIsBuffering(true)}
            onBufferEnd={() => setIsBuffering(false)}
            onReady={() => setIsBuffering(false)}
            onEnded={async () => {
              setIsPlaying(false)

              // Clear saved progress when video completes
              if (lessonId && currentCourseId) {
                const savedKey = `lesson_progress_${currentCourseId}_${lessonId}`
                localStorage.removeItem(savedKey)
              }

              // Mark lesson as complete
              if (lessonId && currentCourseId) {
                try {
                  const api = (await import('@/api/axios')).api
                  const response = await api.post(`/courses/${currentCourseId}/lessons/${lessonId}/complete`)
                  const data = response.data

                  console.log('Lesson marked as complete:', data)

                  // Check if course is completed
                  if (data.course_completed && data.certificate_available) {
                    try {
                      const certResponse = await api.post(`/certificates/generate/${currentCourseId}`)
                      setCertificateUrl(certResponse.data.certificate_url)
                      setCertificateId(certResponse.data.certificate_id)
                      setShowCertificateModal(true)
                      toast.success('Congratulations! Course completed!')
                    } catch (certError) {
                      console.error('Error generating certificate:', certError)
                      toast.success('Congratulations! Course completed!')
                    }
                  }
                } catch (error: any) {
                  console.error('Error marking lesson as complete:', error)
                  if (error.response?.status === 401) {
                    console.log('Authentication required - user will be logged out')
                  }
                }
              }

              // Show autoplay countdown for next lesson
              if (lessonId && course && course.lessons) {
                const currentIndex = course.lessons.findIndex((l: any) => l.id === parseInt(lessonId!))
                if (currentIndex < course.lessons.length - 1) {
                  setShowAutoplayCountdown(true)
                  setAutoplayCountdown(5)

                  // Countdown timer
                  let countdown = 5
                  const countdownInterval = setInterval(() => {
                    countdown--
                    setAutoplayCountdown(countdown)
                    if (countdown === 0) {
                      clearInterval(countdownInterval)
                      const nextLesson = course.lessons[currentIndex + 1]
                      navigateToLesson(nextLesson.id, nextLesson.type)
                    }
                  }, 1000)

                  // Store interval ref for cleanup
                  autoplayTimerRef.current = countdownInterval as unknown as NodeJS.Timeout
                }
              }
            }}
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload'
                }
              }
            }}
          />

          {/* Custom Controls Overlay */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 transition-opacity duration-300",
            showControls ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}>
            {/* Top Controls */}
            <div className="absolute top-0 left-0 right-0 p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => navigate(`/courses/${currentCourseId}`)}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="text-white text-center">
                  <h1 className="font-semibold">{lesson.title}</h1>
                  <p className="text-sm text-white/80">{course.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Quality Settings */}
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="bg-white/20 text-white border border-white/30 rounded px-2 py-1 text-sm"
                    title="Video Quality"
                  >
                    <option value="auto">Auto</option>
                    <option value="1080p">1080p HD</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                    <option value="360p">360p</option>
                  </select>

                  {/* Playback Speed */}
                  <select
                    value={playbackRate}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    className="bg-white/20 text-white border border-white/30 rounded px-2 py-1 text-sm"
                    title="Playback Speed"
                  >
                    <option value={0.25}>0.25x</option>
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x (Normal)</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={1.75}>1.75x</option>
                    <option value={2}>2x</option>
                  </select>

                  {/* Keyboard Shortcuts Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                    title="Keyboard Shortcuts (?)"
                  >
                    <span className="text-sm font-bold">?</span>
                  </Button>

                  {/* Fullscreen Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => {
                      if (containerRef.current) {
                        if (!document.fullscreenElement) {
                          containerRef.current.requestFullscreen()
                          setIsFullscreen(true)
                        } else {
                          document.exitFullscreen()
                          setIsFullscreen(false)
                        }
                      }
                    }}
                    title="Fullscreen (F)"
                  >
                    <Maximize className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Buffering Indicator */}
            {isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mb-4 mx-auto"></div>
                  <p className="text-white text-sm">Loading...</p>
                </div>
              </div>
            )}

            {/* Autoplay Countdown */}
            {showAutoplayCountdown && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="bg-white rounded-lg p-8 max-w-md text-center">
                  <CheckCircle className="w-16 h-16 text-success-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-neutral-900 mb-2">Lesson Complete!</h3>
                  <p className="text-neutral-600 mb-6">
                    Next lesson starts in <span className="font-bold text-primary-600 text-2xl">{autoplayCountdown}</span> seconds
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAutoplayCountdown(false)
                        if (autoplayTimerRef.current) {
                          clearInterval(autoplayTimerRef.current as unknown as number)
                        }
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (autoplayTimerRef.current) {
                          clearInterval(autoplayTimerRef.current as unknown as number)
                        }
                        const currentIndex = course.lessons.findIndex((l: any) => l.id === parseInt(lessonId!))
                        if (currentIndex < course.lessons.length - 1) {
                          const nextLesson = course.lessons[currentIndex + 1]
                          navigateToLesson(nextLesson.id, nextLesson.type)
                        }
                      }}
                      className="flex-1"
                    >
                      Play Now
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Center Play Button */}
            {!isPlaying && !isBuffering && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 border border-white/30"
                  onClick={handlePlayPause}
                >
                  <Play className="w-8 h-8 text-white ml-1" />
                </Button>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              {/* Enhanced Progress Bar with Seek */}
              <div className="mb-4">
                {/* Visual progress bar container */}
                <div className="relative group">
                  {/* Clickable seek area */}
                  <div
                    className="absolute inset-x-0 -top-3 bottom-0 z-10 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('Progress bar clicked!')
                      console.log('handleSeek function:', handleSeek)
                      console.log('playerRef:', playerRef)

                      try {
                        // Get the actual progress bar element for accurate width calculation
                        const progressBar = e.currentTarget.parentElement?.querySelector('.progress-bar-track')
                        console.log('progressBar element found:', progressBar)
                        console.log('duration:', duration)

                        if (progressBar && duration > 0) {
                          const rect = progressBar.getBoundingClientRect()
                          const clickX = e.clientX - rect.left
                          const percentage = Math.max(0, Math.min(1, clickX / rect.width))
                          const seekTime = percentage * duration
                          console.log('Seek clicked:', { clickX, width: rect.width, percentage, seekTime, duration })
                          console.log('About to call handleSeek with:', seekTime)
                          handleSeek(seekTime)
                          console.log('handleSeek called!')
                        } else {
                          console.warn('Cannot seek - progressBar:', progressBar, 'duration:', duration)
                        }
                      } catch (error) {
                        console.error('Error in seek click handler:', error)
                      }
                    }}
                    onMouseMove={(e) => {
                      const progressBar = e.currentTarget.parentElement?.querySelector('.progress-bar-track')
                      if (progressBar && duration > 0) {
                        const rect = progressBar.getBoundingClientRect()
                        const hoverX = e.clientX - rect.left
                        const percentage = Math.max(0, Math.min(1, hoverX / rect.width))
                        const hoverTime = percentage * duration
                        e.currentTarget.title = `Seek to ${formatTime(hoverTime)}`
                      }
                    }}
                  />

                  {/* Visual progress bar */}
                  <div className="relative pointer-events-none">
                    <div className="progress-bar-track h-1 bg-white/20 rounded-full overflow-hidden group-hover:h-2 transition-all">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-150"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {/* Seek dot */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-white/80 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => skipTime(-10)}
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => skipTime(10)}
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={toggleMute}
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </Button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Sidebar Toggle Button - Only visible when sidebar is collapsed and during video playback */}
        {!isSidebarExpanded && !isFullscreen && (
          <Button
            onClick={toggleSidebar}
            className={cn(
              "fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full shadow-2xl transition-all duration-300",
              "bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700",
              "border-4 border-white hover:scale-110 active:scale-95",
              showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            title="Show Curriculum"
          >
            <div className="relative">
              <BookOpen className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-success-500 rounded-full animate-pulse" />
            </div>
          </Button>
        )}
      </div>

      {/* Content Area */}
      <div className="bg-neutral-50 min-h-screen relative">
        <div className={cn(
          "py-8 transition-all duration-300",
          isSidebarExpanded ? "container-custom" : "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        )}>
          {/* Enhanced Sidebar Toggle Section */}
          <div className="flex items-center justify-between mb-6 bg-white rounded-lg p-4 shadow-sm border border-neutral-200">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                isSidebarExpanded
                  ? "bg-primary-100 text-primary-600"
                  : "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200"
              )}>
                {isSidebarExpanded ? (
                  <BookOpen className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5 animate-pulse" />
                )}
              </div>
              <div>
                <h2 className="font-semibold text-neutral-900 text-sm">
                  {isSidebarExpanded ? "Learning Mode" : "Focus Mode"}
                </h2>
                <p className="text-xs text-neutral-600">
                  {isSidebarExpanded
                    ? "Browse curriculum while learning"
                    : "Immersive learning experience"}
                </p>
              </div>
            </div>

            <Button
              onClick={toggleSidebar}
              className={cn(
                "gap-2 transition-all duration-300 shadow-sm hover:shadow-md",
                isSidebarExpanded
                  ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                  : "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white"
              )}
              size="sm"
              title={isSidebarExpanded ? "Switch to Focus Mode" : "Switch to Learning Mode"}
            >
              {isSidebarExpanded ? (
                <>
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Focus Mode</span>
                  <span className="sm:hidden">Focus</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Show Curriculum</span>
                  <span className="sm:hidden">Show</span>
                </>
              )}
            </Button>
          </div>

          {/* Mobile Sidebar Overlay */}
          {!isSidebarExpanded && (
            <div
              className="lg:hidden fixed inset-0 bg-black/50 z-30 opacity-0 pointer-events-none transition-opacity"
              onClick={toggleSidebar}
            />
          )}

          <div className={cn(
            "grid gap-8 transition-all duration-300",
            isSidebarExpanded ? "lg:grid-cols-4" : "lg:grid-cols-1"
          )}>
            {/* Main Content */}
            <div className={cn(
              "transition-all duration-300",
              isSidebarExpanded ? "lg:col-span-3" : "lg:col-span-1 mx-auto w-full max-w-5xl"
            )}>
              <Card className={cn(
                "transition-all duration-300",
                !isSidebarExpanded && "shadow-2xl border-primary-100 ring-1 ring-primary-200"
              )}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">
                        {lesson.title}
                      </CardTitle>
                      <p className="text-neutral-600">
                        {lesson.description}
                      </p>
                    </div>
                    <Button
                      onClick={handleMarkComplete}
                      disabled={lesson.is_completed}
                    >
                      {lesson.is_completed ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        "Mark Complete"
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
                    <Tabs.List className="grid w-full grid-cols-4 bg-neutral-100 rounded-lg p-1">
                      <Tabs.Trigger
                        value="overview"
                        className="px-4 py-2 rounded-md font-medium text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Overview
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value="notes"
                        className="px-4 py-2 rounded-md font-medium text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Notes
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value="resources"
                        className="px-4 py-2 rounded-md font-medium text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Resources
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value="discussion"
                        className="px-4 py-2 rounded-md font-medium text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm"
                      >
                        Discussion
                      </Tabs.Trigger>
                    </Tabs.List>

                    {/* Overview Tab */}
                    <Tabs.Content value="overview" className="mt-6">
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: lesson.content }}
                      />
                    </Tabs.Content>

                    {/* Notes Tab */}
                    <Tabs.Content value="notes" className="mt-6">
                      <div className="space-y-6">
                        {/* Add Note at Current Time */}
                        <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4 text-primary-600" />
                            <h3 className="font-semibold text-primary-900">Add Note at {formatTime(currentTime)}</h3>
                          </div>
                          <textarea
                            value={userNotes}
                            onChange={(e) => setUserNotes(e.target.value)}
                            placeholder="Take a note at this timestamp..."
                            className="w-full h-24 p-3 border border-primary-200 rounded-lg resize-none mb-2"
                          />
                          <Button
                            onClick={() => {
                              if (userNotes.trim()) {
                                const newNote = {
                                  timestamp: currentTime,
                                  content: userNotes,
                                  date: new Date().toISOString()
                                }

                                // Save to localStorage
                                const savedKey = `lesson_notes_${currentCourseId}_${lessonId}`
                                const existingNotes = localStorage.getItem(savedKey)
                                const notes = existingNotes ? JSON.parse(existingNotes) : []
                                notes.push(newNote)
                                localStorage.setItem(savedKey, JSON.stringify(notes))

                                // Update lesson notes
                                setLesson({
                                  ...lesson,
                                  notes: [...(lesson.notes || []), newNote]
                                })

                                setUserNotes('')
                                toast.success('Note saved!')
                              }
                            }}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Save Note
                          </Button>
                        </div>

                        {/* My Notes List */}
                        <div>
                          <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            My Notes ({lesson.notes?.length || 0})
                          </h3>

                          {(!lesson.notes || lesson.notes.length === 0) ? (
                            <div className="text-center py-8 text-neutral-500">
                              <FileText className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
                              <p>No notes yet. Add your first note above!</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {lesson.notes.map((note: any, index: number) => (
                                <div key={index} className="flex gap-3 p-4 bg-white border border-neutral-200 rounded-lg hover:shadow-sm transition-shadow">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-shrink-0 h-8"
                                    onClick={() => handleSeek(note.timestamp)}
                                    title="Jump to this timestamp"
                                  >
                                    <Play className="w-3 h-3 mr-1" />
                                    {formatTime(note.timestamp)}
                                  </Button>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-neutral-900 whitespace-pre-wrap">{note.content}</p>
                                    {note.date && (
                                      <p className="text-xs text-neutral-500 mt-1">
                                        {new Date(note.date).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex-shrink-0 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                                    onClick={() => {
                                      const updatedNotes = lesson.notes.filter((_: any, i: number) => i !== index)
                                      setLesson({ ...lesson, notes: updatedNotes })

                                      // Update localStorage
                                      const savedKey = `lesson_notes_${currentCourseId}_${lessonId}`
                                      localStorage.setItem(savedKey, JSON.stringify(updatedNotes))

                                      toast.success('Note deleted')
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Tabs.Content>

                    {/* Resources Tab */}
                    <Tabs.Content value="resources" className="mt-6">
                      <div>
                        <h3 className="font-semibold mb-4">Downloadable Resources</h3>
                        {lesson.attachments && lesson.attachments.length > 0 ? (
                          <div className="space-y-3">
                            {lesson.attachments.map((attachment, index) => {
                              const fileUrl = typeof attachment === 'string' ? attachment : attachment.url;
                              const fileName = typeof attachment === 'string' ? attachment.split('/').pop() : attachment.name;
                              const fileSize = typeof attachment === 'object' && attachment.size ?
                                (attachment.size < 1024 ? `${attachment.size} B` :
                                 attachment.size < 1024 * 1024 ? `${(attachment.size / 1024).toFixed(1)} KB` :
                                 `${(attachment.size / (1024 * 1024)).toFixed(1)} MB`) : '';
                              const fullUrl = fileUrl.startsWith('http') ? fileUrl : getBackendUrl(fileUrl);

                              return (
                                <div key={index} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                      <FileText className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium">{fileName}</h4>
                                      {fileSize && <p className="text-sm text-neutral-600">{fileSize}</p>}
                                    </div>
                                  </div>
                                  <a
                                    href={fullUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Button variant="outline" size="sm">
                                      <Download className="w-4 h-4 mr-2" />
                                      Download
                                    </Button>
                                  </a>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-neutral-500">No resources available for this lesson.</p>
                        )}
                      </div>
                    </Tabs.Content>

                    {/* Discussion Tab */}
                    <Tabs.Content value="discussion" className="mt-6">
                      <div className="space-y-6">
                        {/* Add Question */}
                        <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                          <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            Ask a Question
                          </h3>
                          <textarea
                            placeholder="Ask a question about this lesson..."
                            className="w-full h-24 p-3 border border-neutral-200 rounded-lg resize-none mb-2"
                          />
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-neutral-600">
                              <input type="checkbox" className="rounded" />
                              Include current timestamp ({formatTime(currentTime)})
                            </label>
                            <Button>
                              Post Question
                            </Button>
                          </div>
                        </div>

                        {/* Questions List */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Questions & Answers</h3>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">All</Button>
                              <Button variant="ghost" size="sm">Unanswered</Button>
                              <Button variant="ghost" size="sm">Instructor Replies</Button>
                            </div>
                          </div>

                          {/* Sample Q&A (mock data) */}
                          <div className="space-y-4">
                            <div className="border border-neutral-200 rounded-lg p-4">
                              <div className="flex gap-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-semibold text-primary-600">JD</span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h4 className="font-medium text-neutral-900">How does this concept apply to real projects?</h4>
                                      <p className="text-xs text-neutral-500">John Doe • 2 days ago • at 3:45</p>
                                    </div>
                                    <Badge variant="outline">Answered</Badge>
                                  </div>
                                  <p className="text-sm text-neutral-600 mb-3">
                                    I'm wondering how I can apply this concept in a production environment...
                                  </p>
                                  {/* Reply */}
                                  <div className="ml-4 border-l-2 border-neutral-200 pl-4 mt-3">
                                    <div className="flex gap-2 mb-2">
                                      <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-semibold text-success-600">IN</span>
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-neutral-900">Instructor</p>
                                        <p className="text-xs text-neutral-500">1 day ago</p>
                                      </div>
                                    </div>
                                    <p className="text-sm text-neutral-700">
                                      Great question! You can use this in production by...
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4 mt-3">
                                    <Button variant="ghost" size="sm">
                                      👍 Helpful (5)
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                      Reply
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Empty State */}
                            <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-lg">
                              <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                              <p className="text-neutral-600">
                                No more questions yet. Be the first to ask!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Tabs.Content>
                  </Tabs.Root>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Shown as overlay on mobile when expanded, side-by-side on desktop */}
            {isSidebarExpanded && (
              <div className={cn(
                "transition-all duration-300",
                "lg:col-span-1",
                // Mobile: fixed overlay
                "fixed inset-0 z-40 lg:relative lg:inset-auto",
                "bg-neutral-50 lg:bg-transparent",
                "overflow-y-auto lg:overflow-visible",
                "p-4 lg:p-0"
              )}>
                {/* Mobile close button */}
                <div className="lg:hidden flex justify-end mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="rounded-full"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Enhanced Stats Card */}
                <Card className="mb-4 bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-3 gap-3">
                      {/* Completed Lessons */}
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="w-10 h-10 mx-auto mb-2 bg-success-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-success-600" />
                        </div>
                        <div className="text-2xl font-bold text-neutral-900">
                          {course.lessons.filter((l: any) => l.is_completed).length}
                        </div>
                        <div className="text-xs text-neutral-600 font-medium">Completed</div>
                      </div>

                      {/* Total Lessons */}
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="w-10 h-10 mx-auto mb-2 bg-primary-100 rounded-full flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="text-2xl font-bold text-neutral-900">
                          {course.lessons.length}
                        </div>
                        <div className="text-xs text-neutral-600 font-medium">Total</div>
                      </div>

                      {/* Progress Percentage */}
                      <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                        <div className="w-10 h-10 mx-auto mb-2 bg-amber-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="text-2xl font-bold text-neutral-900">
                          {Math.round((course.lessons.filter((l: any) => l.is_completed).length / course.lessons.length) * 100)}%
                        </div>
                        <div className="text-xs text-neutral-600 font-medium">Progress</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Course Curriculum */}
                <Card className="shadow-lg border-primary-100">
                <CardHeader className="bg-gradient-to-r from-neutral-50 to-neutral-100">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-primary-600" />
                      </div>
                      <span>Course Content</span>
                    </div>
                    <Badge variant="outline" className="bg-white">
                      {course.lessons.filter((l: any) => l.is_completed).length} / {course.lessons.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Overall Progress with Enhanced Design */}
                  <div className="mb-6 p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary-600" />
                        <span className="text-sm font-semibold text-neutral-900">Overall Progress</span>
                      </div>
                      <span className="text-sm font-semibold text-primary-600">
                        {Math.round((course.lessons.filter((l: any) => l.is_completed).length / course.lessons.length) * 100)}%
                      </span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={(course.lessons.filter((l: any) => l.is_completed).length / course.lessons.length) * 100}
                        className="h-3 bg-white shadow-inner"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer pointer-events-none" />
                    </div>

                    {/* Motivational Message */}
                    {Math.round((course.lessons.filter((l: any) => l.is_completed).length / course.lessons.length) * 100) >= 75 && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-success-700 bg-success-50 px-3 py-2 rounded-lg border border-success-200">
                        <Sparkles className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">You're almost there! Keep up the great work!</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {course.lessons.map((lessonItem: any, index: number) => {
                      const isCurrent = lessonItem.id === parseInt(lessonId!)
                      const lessonProgress = lessonItem.watch_progress || 0 // Percentage watched

                      return (
                        <button
                          key={lessonItem.id}
                          onClick={() => navigateToLesson(lessonItem.id, lessonItem.type)}
                          className={cn(
                            "w-full text-left p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group",
                            isCurrent
                              ? "border-primary-400 bg-gradient-to-br from-primary-50 to-primary-100 text-primary-900 shadow-md ring-2 ring-primary-200 ring-offset-2"
                              : lessonItem.is_completed
                              ? "border-success-300 bg-gradient-to-br from-success-50 to-success-100/50 hover:border-success-400"
                              : "border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-50/30"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {/* Enhanced Progress Circle */}
                            <div className="relative flex-shrink-0 mt-0.5">
                              {lessonItem.is_completed ? (
                                <div className="w-8 h-8 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center shadow-lg shadow-success-200 group-hover:scale-110 transition-transform">
                                  <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                              ) : isCurrent ? (
                                <div className="w-8 h-8 relative group-hover:scale-110 transition-transform">
                                  <svg className="w-6 h-6 transform -rotate-90">
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      className="text-primary-200"
                                    />
                                    <circle
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeDasharray={`${2 * Math.PI * 10}`}
                                      strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress / 100)}`}
                                      className="text-primary-600 transition-all duration-300"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    {lessonItem.type === 'quiz' ? (
                                      <HelpCircle className="w-4 h-4 text-primary-600 group-hover:scale-110 transition-transform" />
                                    ) : lessonItem.type === 'assignment' ? (
                                      <PenTool className="w-4 h-4 text-primary-600 group-hover:scale-110 transition-transform" />
                                    ) : (
                                      <Play className="w-4 h-4 text-primary-600 group-hover:scale-110 transition-transform" />
                                    )}
                                  </div>
                                  <div className="absolute -inset-1 bg-primary-500/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 border-2 border-neutral-300 rounded-full flex items-center justify-center text-neutral-400 group-hover:border-primary-400 group-hover:text-primary-600 group-hover:scale-110 transition-all bg-white">
                                  {lessonItem.type === 'quiz' ? (
                                    <HelpCircle className="w-4 h-4" />
                                  ) : lessonItem.type === 'assignment' ? (
                                    <PenTool className="w-4 h-4" />
                                  ) : (
                                    <span className="text-xs font-bold">{index + 1}</span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <span className={cn(
                                  "font-semibold text-sm line-clamp-2 group-hover:text-primary-700 transition-colors",
                                  isCurrent ? "text-primary-900" : "text-neutral-900"
                                )}>
                                  {lessonItem.title || lessonItem.lesson_title}
                                </span>
                                {isCurrent && (
                                  <Badge className="bg-primary-600 text-white px-2 py-0.5 text-xs animate-pulse">
                                    Now
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-neutral-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{lessonItem.duration || lessonItem.lesson_duration || '5 min'}</span>
                                </div>
                                {isCurrent && progress > 0 && progress < 100 && (
                                  <span className="text-primary-600 font-medium">
                                    {Math.round(progress)}% watched
                                  </span>
                                )}
                                {lessonItem.is_completed && (
                                  <span className="text-success-600 font-medium flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Completed
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={goToPreviousLesson}
                  disabled={course.lessons[0].id === parseInt(lessonId!)}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  className="flex-1"
                  onClick={goToNextLesson}
                  disabled={course.lessons[course.lessons.length - 1].id === parseInt(lessonId!)}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowKeyboardShortcuts(false)}>
          <div className="bg-white rounded-lg max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900">Keyboard Shortcuts</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowKeyboardShortcuts(false)}
              >
                ×
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-neutral-900 mb-3">Playback</h3>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Play/Pause</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded border text-sm">Space</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Play/Pause</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded border text-sm">K</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Skip forward 10s</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded border text-sm">→</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Skip forward 10s</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded border text-sm">L</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Skip backward 10s</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded border text-sm">←</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Skip backward 10s</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded border text-sm">J</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Jump to 0%-90%</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded border text-sm">0-9</kbd>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-neutral-900 mb-3">Volume & Display</h3>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Volume up</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded border text-sm">↑</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Volume down</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded border text-sm">↓</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Mute/Unmute</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded border text-sm">M</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Fullscreen</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded border text-sm">F</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Speed up</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded border text-sm">&gt;</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Slow down</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded border text-sm">&lt;</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-600">Show shortcuts</span>
                  <kbd className="px-2 py-1 bg-neutral-100 rounded border text-sm">?</kbd>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-sm text-neutral-600">Press <kbd className="px-1 py-0.5 bg-neutral-100 rounded border text-xs">?</kbd> anytime to show this dialog</p>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Completion Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-success-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                Congratulations! 🎉
              </h2>
              <p className="text-neutral-600 mb-6">
                You've successfully completed this course and earned your certificate!
              </p>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={() => {
                  if (certificateUrl) {
                    // Open certificate with backend URL
                    const fullCertificateUrl = getCertificateUrl(certificateUrl)
                    window.open(fullCertificateUrl, '_blank')
                  }
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Certificate
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={async () => {
                  if (certificateId) {
                    try {
                      await certificatesAPI.downloadCertificate(certificateId)
                      toast.success('Certificate downloaded')
                    } catch (error) {
                      toast.error('Failed to download certificate')
                    }
                  }
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowCertificateModal(false)
                  navigate('/dashboard')
                }}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Plus, Trash2, Save, Eye, Video, FileText, HelpCircle, PenTool, ChevronDown, ChevronRight, Clock, GripVertical, Link as LinkIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { ImageUpload } from '@/components/upload/image-upload'
import { VideoUpload } from '@/components/upload/video-upload'
import { useAuthStore } from '@/store/auth'
import { useCallback, useRef } from 'react'
import { api } from '@/api/axios'

interface CourseData {
  id: number
  title: string
  description: string
  shortDescription: string
  category: string
  course_type: string
  level: string
  language: string
  price: number
  discountPrice?: number
  thumbnail: string
  introVideo?: string
  status: 'published' | 'draft' | 'pending'
  tags: string[]
  requirements: string[]
  learningObjectives: string[]
  sections: Section[]
  createdAt: string
  updatedAt: string
}

interface Section {
  id: string
  title: string
  description: string
  lectures: Lecture[]
}

interface Lecture {
  id: string
  title: string
  type: 'video' | 'text' | 'quiz' | 'assignment'
  duration: string
  content: string
  videoUrl?: string
  youtubeUrl?: string
  videoDuration?: number
  resources?: Resource[]
  isPublished: boolean
}

interface Resource {
  id: string
  title: string
  type: 'pdf' | 'doc' | 'link' | 'zip'
  url: string
  size?: string
}

export function EditCourse() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const accessToken = useAuthStore(state => state.accessToken)
  const [course, setCourse] = useState<CourseData | null>(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [isLoading, setIsLoading] = useState(true)
  const [certTemplates, setCertTemplates] = React.useState<any[]>([])
  const [newTag, setNewTag] = useState('')
  const [savingLessons, setSavingLessons] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [sectionsDirty, setSectionsDirty] = useState(false)
  const [expandedLectures, setExpandedLectures] = useState<Set<string>>(new Set())

  // Debounce timers for text updates
  const updateTimerRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

  // Debounce helper
  const debounce = useCallback((key: string, callback: () => void, delay: number = 1000) => {
    if (updateTimerRef.current[key]) {
      clearTimeout(updateTimerRef.current[key])
    }
    updateTimerRef.current[key] = setTimeout(callback, delay)
  }, [])

  useEffect(() => {
    // Fetch certificate templates
    api.get('/certificates/templates/list').then(res => {
      setCertTemplates(res.data || [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return

      try {
        setIsLoading(true)

        const response = await api.get(`/courses/${id}`)
        const data = response.data

        // Transform lessons into sections/lectures structure
        const sections: Section[] = []
        const allLectures: any[] = []

        // Add lessons
        if (data.lessons && data.lessons.length > 0) {
          allLectures.push(...data.lessons.map((lesson: any) => {
            const hasVideo = !!(lesson.lesson_video || lesson.video_url)
            const hasYoutube = !!lesson.youtube_url
            // Infer type based on content. If it has a youtube URL or video URL, consider it a video. Otherwise, consider it text.
            const inferredType = (hasVideo || hasYoutube) ? 'video' : 'text'

            return {
              id: `lesson-${lesson.id}`,
              title: lesson.title || lesson.lesson_title,
              type: inferredType as any,
              duration: lesson.duration ? lesson.duration.toString() : (lesson.video_duration || '0'),
              content: lesson.lesson_content || lesson.content || '',
              videoUrl: lesson.lesson_video || lesson.video_url || '',
              youtubeUrl: lesson.youtube_url || '',
              resources: [],
              isPublished: lesson.post_status === 'publish' || lesson.post_status === 'published' || lesson.is_preview,
              sourceType: 'lesson',
              sourceId: lesson.id.toString(),
              createdAt: lesson.created_at || lesson.post_date
            }
          }))
        }

        // Add quizzes
        if (data.quizzes && data.quizzes.length > 0) {
          allLectures.push(...data.quizzes.map((quiz: any) => ({
            id: `quiz-${quiz.id}`,
            title: quiz.title,
            type: 'quiz' as const,
            duration: quiz.time_limit ? `${quiz.time_limit}` : '30',
            content: `Quiz with ${quiz.questions_count} question(s)`,
            videoUrl: '',
            resources: [],
            isPublished: true,
            sourceType: 'quiz',
            sourceId: quiz.id.toString(),
            questionsCount: quiz.questions_count,
            createdAt: quiz.created_at
          })))
        }

        // Add assignments
        if (data.assignments && data.assignments.length > 0) {
          allLectures.push(...data.assignments.map((assignment: any) => ({
            id: `assignment-${assignment.id}`,
            title: assignment.title,
            type: 'assignment' as const,
            duration: '0',
            content: assignment.description || '',
            videoUrl: '',
            resources: [],
            isPublished: true,
            sourceType: 'assignment',
            sourceId: assignment.id.toString(),
            createdAt: assignment.created_at
          })))
        }

        // Restore sections from saved sections_meta (preserves user-defined order)
        const savedMeta = data.sections_meta || data.course_sections_meta
        if (savedMeta) {
          try {
            const savedSections = JSON.parse(savedMeta)
            const lectureMap = new Map(allLectures.map((l: any) => [l.id, l]))
            savedSections.forEach((s: any) => {
              const sectionLectures = (s.lectureIds || [])
                .map((lid: string) => lectureMap.get(lid))
                .filter(Boolean)
              sections.push({
                id: s.id,
                title: s.title || 'Section',
                description: s.description || '',
                lectures: sectionLectures
              })
            })
            const assignedIds = new Set(savedSections.flatMap((s: any) => s.lectureIds || []))
            const orphans = allLectures.filter((l: any) => !assignedIds.has(l.id))
            if (orphans.length > 0 && sections.length > 0) {
              sections[0].lectures = [...sections[0].lectures, ...orphans]
            }
          } catch (e) {
            sections.push({ id: 'section-1', title: 'Course Content', description: '', lectures: allLectures })
          }
        } else if (allLectures.length > 0) {
          sections.push({ id: 'section-1', title: 'Course Content', description: '', lectures: allLectures })
        }
        // Transform API data to CourseData format
        const transformedCourse: CourseData = {
          id: data.id,
          title: data.title,
          description: data.content,
          shortDescription: data.excerpt,
          category: data.category,
          course_type: data.course_type || '',
          level: data.level,
          language: data.language || 'English',
          price: data.price,
          discountPrice: 0,
          thumbnail: data.thumbnail,
          introVideo: data.intro_video || '',
          status: data.status,
          tags: [],
          requirements: Array.isArray(data.requirements) ? data.requirements : [],
          learningObjectives: Array.isArray(data.benefits) ? data.benefits : [],
          sections: sections,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        }

        setCourse(transformedCourse)
      } catch (error) {
        console.error('Error fetching course:', error)
        toast.error('Failed to load course data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setCourse(prev => ({ ...prev, [name]: value }))
  }

  const addTag = () => {
    if (newTag.trim() && !course.tags.includes(newTag.trim())) {
      setCourse(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setCourse(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const updateArrayField = (field: 'requirements' | 'learningObjectives', index: number, value: string) => {
    setCourse(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayField = (field: 'requirements' | 'learningObjectives') => {
    setCourse(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayField = (field: 'requirements' | 'learningObjectives', index: number) => {
    setCourse(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      title: '',
      description: '',
      lectures: []
    }
    setCourse(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }))
  }

  const updateSection = (sectionId: string, field: string, value: string) => {
    setCourse(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    }))
    // Mark section as dirty so save button knows to persist
    setSectionsDirty(true)
  }

  const removeSection = (sectionId: string) => {
    setCourse(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }))
  }

  const addLecture = async (sectionId: string) => {
    if (!course || !accessToken) {
      toast.error('Please login to add lessons')
      return
    }

    try {
      // Create lesson via API
      const response = await api.post(`/courses/${course.id}/lessons`, {
        title: 'New Lesson',
        content: '',
        video_url: '',
        video_duration: 0,
        is_preview: false
      })

      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to create lesson')
      }

      const newLesson = response.data

      // Add to UI
      const newLecture: Lecture = {
        id: newLesson.id.toString(),
        title: newLesson.title,
        type: 'text',
        duration: newLesson.video_duration || '',
        content: newLesson.content || '',
        videoUrl: newLesson.video_url || '',
        resources: [],
        isPublished: true
      }
      setCourse(prev => {
        const updated = {
          ...prev,
          sections: prev.sections.map(section =>
            section.id === sectionId
              ? { ...section, lectures: [...section.lectures, newLecture] }
              : section
          )
        }
        const secMeta = updated.sections.map((s: any, idx: number) => ({
          id: s.id, title: s.title, description: s.description || '', order: idx,
          lectureIds: s.lectures.map((l: any) => {
            const lid = l.id.toString()
            return (lid.startsWith('lesson-') || lid.startsWith('quiz-') || lid.startsWith('assignment-')) ? lid : 'lesson-' + lid
          })
        }))
        api.put(`/courses/${prev.id}`, { sections_meta: JSON.stringify(secMeta) }).catch(() => {})
        return updated
      })
      toast.success('Lesson created successfully')
    } catch (error: any) {
      console.error('Error creating lesson:', error)
      toast.error('Failed to create lesson')
    }
  }

  const updateLecture = async (sectionId: string, lectureId: string, field: string, value: any, skipDebounce: boolean = false) => {
    if (!course || !accessToken) {
      toast.error('Please login to update lesson')
      return
    }

    // First update local state for immediate UI feedback
    setCourse(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
            ...section,
            lectures: section.lectures.map(lecture =>
              lecture.id === lectureId ? { ...lecture, [field]: value } : lecture
            )
          }
          : section
      )
    }))

    // Prepare the API call
    const performUpdate = async () => {
      // Mark lesson as saving
      setSavingLessons(prev => new Set(prev).add(lectureId))

      try {
        // Prepare update data based on field
        const updateData: any = {}


        if (field === 'title') updateData.title = value as string
        else if (field === 'content') updateData.content = value as string
        else if (field === 'videoUrl') updateData.video_url = value as string
        else if (field === 'youtubeUrl') updateData.youtube_url = value as string
        else if (field === 'duration') {
          // Convert duration string to seconds if needed
          const duration = value as string
          updateData.video_duration = duration ? parseInt(duration) || 0 : 0
        }
        else if (field === 'isPublished') updateData.is_preview = value as boolean
        else if (field === 'type') {
          // Type changes don't need backend update for now
          setSavingLessons(prev => {
            const next = new Set(prev)
            next.delete(lectureId)
            return next
          })
          return
        }

        // Extract the real ID from the composite key
        const realId = lectureId.replace(/^(lesson|quiz|assignment)-/, '');

        const response = await api.patch(`/courses/${course.id}/lessons/${realId}`, updateData)

        if (response.status !== 200) {
          throw new Error(response.data?.detail || 'Failed to update lesson')
        }

        // Don't show success toast for every field change (too noisy)
        if (field === 'videoUrl') {
          toast.success('Video updated successfully')
        }
      } catch (error: any) {
        console.error('Error updating lesson:', error)
        toast.error(error.message || 'Failed to update lesson')

        // Revert local state on error
        window.location.reload()
      } finally {
        // Remove from saving state
        setSavingLessons(prev => {
          const next = new Set(prev)
          next.delete(lectureId)
          return next
        })
      }
    }

    // Debounce text field updates, but immediately update videos and toggles
    const shouldDebounce = (field === 'title' || field === 'content') && !skipDebounce

    if (shouldDebounce) {
      debounce(`lesson-${lectureId}-${field}`, performUpdate, 1500)
    } else {
      await performUpdate()
    }
  }

  const moveLecture = (sectionId: string, lectureId: string, direction: 'up' | 'down') => {
    setCourse(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id !== sectionId) return section
        const idx = section.lectures.findIndex(l => l.id === lectureId)
        if (idx === -1) return section
        const lectures = [...section.lectures]
        if (direction === 'up' && idx > 0) {
          [lectures[idx-1], lectures[idx]] = [lectures[idx], lectures[idx-1]]
        } else if (direction === 'down' && idx < lectures.length - 1) {
          [lectures[idx], lectures[idx+1]] = [lectures[idx+1], lectures[idx]]
        }
        return { ...section, lectures }
      })
    }))
  }

  const removeLecture = async (sectionId: string, lectureId: string) => {
    if (!course || !accessToken) {
      toast.error('Please login to delete lesson')
      return
    }

    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      return
    }

    // Optimistically remove from UI
    const previousSections = course.sections
    setCourse(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
            ...section,
            lectures: section.lectures.filter(lecture => lecture.id !== lectureId)
          }
          : section
      )
    }))

    try {
      // Extract the real ID and route to correct endpoint based on type
      const realId = lectureId.replace(/^(lesson|quiz|assignment)-/, '');
      let response;
      if (lectureId.startsWith('quiz-')) {
        response = await api.delete(`/courses/${course.id}/quizzes/${realId}`)
      } else if (lectureId.startsWith('assignment-')) {
        response = await api.delete(`/courses/${course.id}/assignments/${realId}`)
      } else {
        response = await api.delete(`/courses/${course.id}/lessons/${realId}`)
      }
      if (response.status !== 200 && response.status !== 204) {
        throw new Error('Failed to delete')
      }
      toast.success('Deleted successfully')
    } catch (error: any) {
      console.error('Error deleting lesson:', error)
      toast.error('Failed to delete lesson')

      // Rollback on error
      setCourse(prev => ({
        ...prev,
        sections: previousSections
      }))
    }
  }

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    setCourse(prev => {
      const idx = prev.sections.findIndex(s => s.id === sectionId)
      if (idx === -1) return prev
      const sections = [...prev.sections]
      if (direction === 'up' && idx > 0) {
        [sections[idx-1], sections[idx]] = [sections[idx], sections[idx-1]]
      } else if (direction === 'down' && idx < sections.length - 1) {
        [sections[idx], sections[idx+1]] = [sections[idx+1], sections[idx]]
      }
      return { ...prev, sections }
    })
  }

  const handleSave = async () => {
    if (!course) return

    try {
      setIsLoading(true)

      // Prepare update data
      const updateData = {
        title: course.title,
        description: course.description,
        content: course.description,
        excerpt: course.shortDescription,
        thumbnail: course.thumbnail,
        intro_video: course.introVideo || '',
        price: course.price,
        level: course.level.toLowerCase(),
        category: course.category,
        course_type: course.course_type || '',
        language: course.language,
        requirements: course.requirements,
        benefits: course.learningObjectives,
        certificate_id: course.certificateId || null,
      }

      // Use api instance which handles authentication automatically
      updateData['sections_meta'] = JSON.stringify(course.sections.map((s: any, idx: number) => ({
        id: s.id, title: s.title, description: s.description, order: idx,
        lectureIds: s.lectures.map((l: any) => l.id.startsWith('lesson-')||l.id.startsWith('quiz-')||l.id.startsWith('assignment-') ? l.id : 'lesson-'+l.id)
      })))
      await api.put(`/courses/${course.id}`, updateData)

      toast.success('Course updated successfully!')
    } catch (error: any) {
      console.error('Error updating course:', error)
      toast.error(error.response?.data?.detail || error.message || 'Failed to update course')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async () => {
    setCourse(prev => ({ ...prev, status: 'published' }))
    await handleSave()
    navigate(isAdmin ? '/admin/courses' : '/instructor/courses')
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId)
      } else {
        newSet.add(sectionId)
      }
      return newSet
    })
  }

  const toggleLecture = (lectureId: string) => {
    setExpandedLectures(prev => {
      const newSet = new Set(prev)
      if (newSet.has(lectureId)) {
        newSet.delete(lectureId)
      } else {
        newSet.add(lectureId)
      }
      return newSet
    })
  }

  const getLectureIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'text':
        return <FileText className="h-4 w-4" />
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />
      case 'assignment':
        return <PenTool className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course data...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-4">The course you're trying to edit doesn't exist.</p>
          <Link to="/instructor/courses" className="text-blue-600 hover:underline">Back to Courses</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/instructor/courses" className="flex items-center text-blue-600 hover:text-blue-700 mr-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Courses
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
              <p className="text-gray-600 mt-1">
                Last updated: {new Date(course.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className={course.status === 'published' ? 'bg-green-600' : 'bg-yellow-600'}>
              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
            </Badge>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'basic', label: 'Basic Info' },
                { id: 'content', label: 'Content' },
                { id: 'curriculum', label: 'Curriculum' },
                { id: 'settings', label: 'Settings' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'basic' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={course.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description *
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={course.shortDescription}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Description *
                </label>
                <textarea
                  name="description"
                  value={course.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course Type</label>
                  <select
                    name="course_type"
                    value={course.course_type || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">-- Select Type --</option>
                    <option value="Meiporul">Meiporul (AR/VR)</option>
                    <option value="Seyappaduporul">Seyappaduporul (Skill)</option>
                    <option value="Utporul">Utporul (Tech)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={course.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select Category --</option>
                    <option value="Meiporul">Meiporul (AR/VR)</option>
                    <option value="Seyappaduporul">Seyappaduporul (Skill)</option>
                    <option value="Utporul">Utporul (Tech)</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Machine Learning">Machine Learning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                  <select
                    name="level"
                    value={course.level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    name="language"
                    value={course.language}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={course.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price (₹)</label>
                  <input
                    type="number"
                    name="discountPrice"
                    value={course.discountPrice || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <ImageUpload
                  value={course.thumbnail}
                  onChange={(url) => setCourse(prev => ({ ...prev, thumbnail: url }))}
                  label="Course Thumbnail"
                  description="Upload a thumbnail image for your course (recommended: 1280x720px)"
                />
              </div>

              <div>
                <VideoUpload
                  value={course.introVideo}
                  onChange={(url) => setCourse(prev => ({ ...prev, introVideo: url }))}
                  label="Course Intro Video (Optional)"
                  description="Upload a promotional video for your course"
                />
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'content' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Content</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Description *
                </label>
                <textarea
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what students will learn in this course..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Provide a comprehensive description of your course content and learning objectives
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What You'll Learn
                </label>
                <div className="space-y-3">
                  {(course.benefits || []).map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => {
                          const newBenefits = [...(course.benefits || [])]
                          newBenefits[index] = e.target.value
                          setCourse({ ...course, benefits: newBenefits })
                        }}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter a learning outcome"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newBenefits = (course.benefits || []).filter((_, i) => i !== index)
                          setCourse({ ...course, benefits: newBenefits })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCourse({
                        ...course,
                        benefits: [...(course.benefits || []), '']
                      })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Learning Outcome
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements
                </label>
                <div className="space-y-3">
                  {(course.requirements || []).map((requirement, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) => {
                          const newRequirements = [...(course.requirements || [])]
                          newRequirements[index] = e.target.value
                          setCourse({ ...course, requirements: newRequirements })
                        }}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter a requirement"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const newRequirements = (course.requirements || []).filter((_, i) => i !== index)
                          setCourse({ ...course, requirements: newRequirements })
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCourse({
                        ...course,
                        requirements: [...(course.requirements || []), '']
                      })
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Requirement
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <textarea
                  value={course.targetAudience || ''}
                  onChange={(e) => setCourse({ ...course, targetAudience: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Who is this course for?"
                />
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'curriculum' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Course Curriculum</h2>
              <Button onClick={addSection}>
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>

            <div className="space-y-3">
              {course.sections.map((section, sectionIndex) => {
                const isExpanded = expandedSections.has(section.id)
                const totalDuration = section.lectures.reduce((sum, lecture) => {
                  const parts = (lecture.duration || '0').split(':')
                  const minutes = parseInt(parts[0] || '0')
                  const seconds = parseInt(parts[1] || '0')
                  return sum + minutes + (seconds / 60)
                }, 0)

                return (
                  <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    {/* Section Header - Collapsible */}
                    <div
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 cursor-pointer transition-colors"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <button className="text-gray-600 hover:text-gray-900">
                          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </button>
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900">
                            {section.title || `Section ${sectionIndex + 1}`}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>{section.lectures.length} lectures</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{Math.floor(totalDuration)}min</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addLecture(section.id)}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => moveSection(section.id, 'up')} className="text-xs" title="Move up">↑</Button>
                        <Button variant="outline" size="sm" onClick={() => moveSection(section.id, 'down')} className="text-xs" title="Move down">↓</Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSection(section.id)}
                          className="text-red-600 text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Section Content - Expandable */}
                    {isExpanded && (
                      <div className="border-t border-gray-200">
                        {/* Section Edit Fields */}
                        <div className="p-4 bg-gray-50 space-y-3">
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                            placeholder="Section title"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <textarea
                            value={section.description}
                            onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                            placeholder="Section description"
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        {/* Lectures */}
                        <div className="bg-white">
                          <div className="space-y-2 px-4 pb-4">
                            {section.lectures.map((lecture, lectureIndex) => {
                              const isLectureExpanded = expandedLectures.has(lecture.id)

                              return (
                                <div key={lecture.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                  {/* Lecture Header */}
                                  <div
                                    className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => toggleLecture(lecture.id)}
                                  >
                                    <button className="text-gray-400">
                                      {isLectureExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </button>
                                    <GripVertical className="h-4 w-4 text-gray-300" />
                                    {getLectureIcon(lecture.type)}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900">
                                          {lecture.title || `Lecture ${lectureIndex + 1}`}
                                        </span>
                                        <Badge variant={lecture.isPublished ? 'default' : 'secondary'} className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                                          {lecture.isPublished ? 'Free Preview' : 'Paid'}
                                        </Badge>
                                        {savingLessons.has(lecture.id) && (
                                          <Badge className="bg-blue-500 text-xs">Saving...</Badge>
                                        )}
                                        {(lecture as any).sourceType === 'quiz' && (
                                          <Badge className="bg-purple-100 text-purple-700 text-xs">
                                            {(lecture as any).questionsCount} Q
                                          </Badge>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        <span>{lecture.duration || '0'} min</span>
                                        <span className="text-gray-300">•</span>
                                        <span className="capitalize">{lecture.type}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => updateLecture(section.id, lecture.id, 'isPublished', !lecture.isPublished)}
                                        className="h-7 px-2 text-xs"
                                        title={lecture.isPublished ? 'Make Paid' : 'Make Free Preview'}
                                      >
                                        <Eye className="h-3 w-3 mr-1" />
                                        {lecture.isPublished ? 'Remove Preview' : 'Make Preview'}
                                      </Button>
                                      <Button variant="ghost" size="sm" onClick={() => moveLecture(section.id, lecture.id, 'up')} className="h-7 px-2 text-xs" title="Move up">↑</Button>
                                      <Button variant="ghost" size="sm" onClick={() => moveLecture(section.id, lecture.id, 'down')} className="h-7 px-2 text-xs" title="Move down">↓</Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeLecture(section.id, lecture.id)}
                                        className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Lecture Edit Form - Expandable */}
                                  {isLectureExpanded && (
                                    <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <input
                                          type="text"
                                          value={lecture.title}
                                          onChange={(e) => updateLecture(section.id, lecture.id, 'title', e.target.value)}
                                          placeholder="Lecture title"
                                          className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <select
                                          value={lecture.type}
                                          onChange={(e) => updateLecture(section.id, lecture.id, 'type', e.target.value)}
                                          className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                          <option value="video">Video</option>
                                          <option value="text">Text</option>
                                          <option value="quiz">Quiz</option>
                                          <option value="assignment">Assignment</option>
                                        </select>
                                        <input
                                          type="text"
                                          value={lecture.duration}
                                          onChange={(e) => updateLecture(section.id, lecture.id, 'duration', e.target.value)}
                                          placeholder="Duration (min)"
                                          className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                      </div>

                                      <textarea
                                        value={lecture.content}
                                        onChange={(e) => updateLecture(section.id, lecture.id, 'content', e.target.value)}
                                        placeholder="Lecture description"
                                        rows={2}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      />

                                      {lecture.type === 'video' && (
                                        <div className="space-y-3">
                                          <VideoUpload
                                            value={lecture.videoUrl || ''}
                                            onChange={(url) => updateLecture(section.id, lecture.id, 'videoUrl', url)}
                                            onDurationChange={(duration) => {
                                              // Convert minutes to MM:SS format
                                              const minutes = Math.floor(duration)
                                              const seconds = Math.round((duration - minutes) * 60)
                                              const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`
                                              updateLecture(section.id, lecture.id, 'duration', formattedDuration)
                                            }}
                                            label="Upload Lecture Video"
                                            description="Upload a video for this lecture"
                                          />

                                          {/* YouTube URL input for video lectures */}
                                          <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                              <LinkIcon className="w-4 h-4" />
                                              YouTube URL (Alternative)
                                            </label>
                                            <input
                                              type="url"
                                              value={lecture.youtubeUrl || ''}
                                              onChange={(e) => updateLecture(section.id, lecture.id, 'youtubeUrl', e.target.value)}
                                              placeholder="YouTube URL or Bunny player URL (https://player.mediadelivery.net/play/...)"
                                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                            />
                                            <p className="text-xs text-gray-500">
                                              Paste a YouTube video URL to extract and play without branding
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      {lecture.type === 'quiz' && (
                                        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                          <div className="flex items-center justify-between mb-3">
                                            <h5 className="font-medium text-gray-900">Quiz Configuration</h5>
                                            <Button
                                              size="sm"
                                              onClick={() => navigate(`/instructor/courses/${course.id}/quiz-builder/${(lecture as any).sourceId || lecture.id.replace(/^quiz-/, '')}?sectionId=${section.id}`)}
                                            >
                                              <HelpCircle className="h-4 w-4 mr-1" />
                                              {(lecture as any).sourceType === 'quiz' ? 'Edit Quiz' : 'Configure Quiz'}
                                            </Button>
                                          </div>
                                          {(lecture as any).sourceType === 'quiz' ? (
                                            <div className="text-sm text-gray-700">
                                              <p className="mb-1">✓ Quiz configured with {(lecture as any).questionsCount} question(s)</p>
                                              <p className="text-xs text-gray-500">Time limit: {lecture.duration} minutes</p>
                                            </div>
                                          ) : (
                                            <>
                                              <p className="text-sm text-gray-600">
                                                Click "Configure Quiz" to set up questions, time limits, passing scores, and grading options for this quiz.
                                              </p>
                                              <div className="mt-2 text-xs text-gray-500">
                                                Note: Quiz content is managed separately from lesson content.
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      )}

                                      {lecture.type === 'assignment' && (
                                        <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                          <div className="flex items-center justify-between mb-3">
                                            <h5 className="font-medium text-gray-900">Assignment Configuration</h5>
                                            <Button
                                              size="sm"
                                              onClick={() => navigate(`/instructor/courses/${course.id}/assignment-builder/${(lecture as any).sourceId || lecture.id.replace(/^assignment-/, '')}?sectionId=${section.id}`)}
                                            >
                                              <PenTool className="h-4 w-4 mr-1" />
                                              {(lecture as any).sourceType === 'assignment' ? 'Edit Assignment' : 'Configure Assignment'}
                                            </Button>
                                          </div>
                                          {(lecture as any).sourceType === 'assignment' ? (
                                            <div className="text-sm text-gray-700">
                                              <p className="mb-1">✓ Assignment configured</p>
                                              <p className="text-xs text-gray-500">{lecture.content}</p>
                                            </div>
                                          ) : (
                                            <>
                                              <p className="text-sm text-gray-600">
                                                Click "Configure Assignment" to set up submission requirements, file upload settings, grading criteria, and due dates.
                                              </p>
                                              <div className="mt-2 text-xs text-gray-500">
                                                Note: Assignment settings are managed separately from lesson content.
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Settings</h2>
            <div className="space-y-6">
              {/* Certificate Selection */}
              <div className="border border-gray-200 rounded-xl p-6 bg-orange-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 text-xl">🏆</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Certificate of Completion</h3>
                    <p className="text-sm text-gray-500">Students will receive this certificate when they complete the course</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Choose Certificate Template</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* No Certificate option */}
                    <div
                      onClick={() => setCourse(prev => ({ ...prev, certificateId: '' }))}
                      className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 flex flex-col items-center justify-center gap-2 h-40 ${!course.certificateId ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
                    >
                      <span className="text-3xl">🚫</span>
                      <p className="font-medium text-gray-700 text-sm">No Certificate</p>
                      <p className="text-xs text-gray-400 text-center">Students won't receive a certificate</p>
                    </div>
                    {certTemplates.map((t: any) => (
                      <div
                        key={t.id}
                        onClick={() => setCourse(prev => ({ ...prev, certificateId: String(t.id) }))}
                        className={`cursor-pointer rounded-xl border-2 transition-all duration-200 overflow-hidden ${String(course.certificateId) === String(t.id) ? 'border-orange-500 shadow-md' : 'border-gray-200 hover:border-orange-300'}`}
                      >
                        {/* Certificate Preview */}
                        <div
                          className="h-28 flex flex-col items-center justify-center p-4 relative"
                          style={{ backgroundColor: t.bg_color || '#FFF8DC', fontFamily: t.font || 'Georgia' }}
                        >
                          <div className="absolute top-2 left-2 right-2 h-0.5 opacity-30" style={{ backgroundColor: t.title_color }}/>
                          <div className="absolute bottom-2 left-2 right-2 h-0.5 opacity-30" style={{ backgroundColor: t.title_color }}/>
                          <p className="text-xs font-semibold tracking-widest uppercase opacity-60" style={{ color: t.title_color }}>Certificate of Completion</p>
                          <p className="text-sm font-bold mt-1" style={{ color: t.title_color }}>Student Name</p>
                          <p className="text-xs opacity-50 mt-1" style={{ color: t.title_color }}>Course Title</p>
                        </div>
                        {/* Template Name */}
                        <div className={`px-3 py-2 flex items-center justify-between ${String(course.certificateId) === String(t.id) ? 'bg-orange-50' : 'bg-white'}`}>
                          <p className="text-sm font-medium text-gray-800">{t.name || `Template ${t.id}`}</p>
                          {String(course.certificateId) === String(t.id) && (
                            <span className="text-orange-500 text-xs font-bold">✓ Selected</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {course.certificateId && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-3 mt-2">
                      <span className="text-xl">🎓</span>
                      <p className="text-sm text-green-700 font-medium">Certificate enabled — students receive it automatically on 100% completion</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}
        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8">
          <Button variant="outline" onClick={() => navigate(isAdmin ? '/admin/courses' : '/instructor/courses')}>
            Cancel
          </Button>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleSave} disabled={isLoading}>
              Save as Draft
            </Button>
            <Button onClick={handlePublish} disabled={isLoading}>
              {course.status === 'published' ? 'Update & Publish' : 'Publish Course'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
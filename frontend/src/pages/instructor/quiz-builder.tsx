import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  GripVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/api/axios';

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'fill_in_blank';
  question: string;
  points: number;
  options?: string[];
  correctAnswer?: string | number;
  explanation?: string;
  imageUrl?: string;
}

interface QuizSettings {
  title: string;
  description: string;
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  maxAttempts: number;
  randomizeQuestions: boolean;
  showCorrectAnswers: boolean;
  availableFrom?: string;
  availableUntil?: string;
}

const QuizBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { courseId, quizId } = useParams();
  const [searchParams] = useSearchParams();
  const sectionId = searchParams.get('sectionId');

  const [settings, setSettings] = useState<QuizSettings>({
    title: '',
    description: '',
    timeLimit: 30,
    passingScore: 70,
    maxAttempts: 3,
    randomizeQuestions: false,
    showCorrectAnswers: true,
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<'questions' | 'settings'>('questions');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  // Load existing quiz if editing
  useEffect(() => {
    if (quizId && courseId) {
      loadQuiz();
    }
  }, [quizId, courseId]);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/courses/${courseId}/quizzes/${quizId}`);
      const quizData = response.data;

      setSettings({
        title: quizData.title,
        description: quizData.description,
        timeLimit: quizData.timeLimit,
        passingScore: quizData.passingScore,
        maxAttempts: quizData.maxAttempts,
        randomizeQuestions: quizData.randomizeQuestions,
        showCorrectAnswers: quizData.showCorrectAnswers,
      });

      const mappedQuestions = (quizData.questions || []).map((q: any) => ({
        ...q,
        correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer :
          q.type === 'true_false' ? 'true' :
          q.type === 'fill_in_blank' ? '' : undefined
      }))
      setQuestions(mappedQuestions);
      setIsEditingExisting(true); // Mark as editing existing quiz
    } catch (error: any) {
      console.error('Error loading quiz:', error);
      setIsEditingExisting(false); // Mark as creating new quiz
      // If quiz doesn't exist (404), that's okay - we'll create it on save
      if (error.response?.status !== 404) {
        toast.error('Failed to load quiz');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add new question
  const addQuestion = (type: QuizQuestion['type']) => {
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      type,
      question: '',
      points: 1,
      options: type === 'multiple_choice' ? ['', '', '', ''] : undefined,
      correctAnswer: type === 'true_false' ? 'true' : type === 'fill_in_blank' ? '' : undefined,
    };

    setQuestions([...questions, newQuestion]);
  };

  // Update question
  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  // Delete question
  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Update option for multiple choice
  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  // Add option to multiple choice
  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return { ...q, options: [...q.options, ''] };
      }
      return q;
    }));
  };

  // Remove option from multiple choice
  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options && q.options.length > 2) {
        const newOptions = q.options.filter((_, i) => i !== optionIndex);
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  // Save quiz
  const handleSave = async () => {
    if (!settings.title.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    // Validate questions
    const invalidQuestions = questions.filter(q => {
      if (!q.question.trim()) return true;
      if (q.type === 'multiple_choice') {
        if (!q.options || q.options.filter(o => o.trim()).length < 2) return true;
        if (q.correctAnswer === undefined) return true;
      }
      if (q.type === 'true_false' && q.correctAnswer === undefined) return true;
      if (q.type === 'fill_in_blank' && !String(q.correctAnswer || '').trim()) return true;
      return false;
    });

    if (invalidQuestions.length > 0) {
      toast.error(`Please complete all fields for ${invalidQuestions.length} question(s)`);
      return;
    }

    setSaving(true);
    try {
      const quizData = {
        title: settings.title,
        description: settings.description,
        timeLimit: settings.timeLimit,
        passingScore: settings.passingScore,
        maxAttempts: settings.maxAttempts,
        randomizeQuestions: settings.randomizeQuestions,
        showCorrectAnswers: settings.showCorrectAnswers,
        questions: questions
      };

      let savedQuizId = quizId
      if (isEditingExisting) {
        await api.put(`/courses/${courseId}/quizzes/${quizId}`, quizData);
        toast.success('Quiz updated successfully!');
      } else {
        const response = await api.post(`/courses/${courseId}/quizzes`, quizData);
        savedQuizId = response?.data?.id?.toString() || quizId
        toast.success('Quiz created successfully!');
      }

      // Update sections_meta to keep quiz in correct section
      if (sectionId && courseId) {
        try {
          const courseResp = await api.get(`/courses/${courseId}`)
          const courseData = courseResp.data
          let sections = []
          try { sections = JSON.parse(courseData.sections_meta || '[]') } catch { sections = [] }
          const newQuizId = `quiz-${savedQuizId}`
          // Add to section if not already there
          const inSection = sections.some((s: any) => s.lectureIds?.includes(newQuizId))
          if (!inSection) {
            sections = sections.map((s: any) =>
              s.id === sectionId ? { ...s, lectureIds: [...(s.lectureIds || []), newQuizId] } : s
            )
            await api.put(`/courses/${courseId}`, { sections_meta: JSON.stringify(sections) })
          }
        } catch {}
      }
      navigate(`/instructor/courses/${courseId}/edit`);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save quiz');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Calculate total points
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-custom max-w-5xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="btn btn-ghost"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  {quizId ? 'Edit Quiz' : 'Create New Quiz'}
                </h1>
                <p className="text-neutral-600 text-sm mt-1">
                  {questions.length} questions • {totalPoints} total points
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Saving...' : 'Save Quiz'}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'questions'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Questions ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            {/* Add Question Buttons */}
            <div className="bg-white rounded-xl shadow-soft p-6">
              <h3 className="font-semibold text-neutral-900 mb-4">Add Question</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <button
                  onClick={() => addQuestion('multiple_choice')}
                  className="btn btn-outline flex-col h-auto py-4"
                >
                  <CheckCircle className="w-6 h-6 mb-2" />
                  <span className="text-sm">Multiple Choice</span>
                </button>
                <button
                  onClick={() => addQuestion('true_false')}
                  className="btn btn-outline flex-col h-auto py-4"
                >
                  <AlertCircle className="w-6 h-6 mb-2" />
                  <span className="text-sm">True/False</span>
                </button>
                <button
                  onClick={() => addQuestion('short_answer')}
                  className="btn btn-outline flex-col h-auto py-4"
                >
                  <FileText className="w-6 h-6 mb-2" />
                  <span className="text-sm">Short Answer</span>
                </button>
                <button
                  onClick={() => addQuestion('fill_in_blank')}
                  className="btn btn-outline flex-col h-auto py-4"
                >
                  <FileText className="w-6 h-6 mb-2" />
                  <span className="text-sm">Fill in Blank</span>
                </button>
                <button
                  onClick={() => addQuestion('essay')}
                  className="btn btn-outline flex-col h-auto py-4"
                >
                  <FileText className="w-6 h-6 mb-2" />
                  <span className="text-sm">Essay</span>
                </button>
              </div>
            </div>

            {/* Questions List */}
            {questions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-xl shadow-soft p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-2">
                    <GripVertical className="w-5 h-5 text-neutral-400 cursor-move" />
                  </div>

                  <div className="flex-1 space-y-4">
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-neutral-600">
                            Question {index + 1}
                          </span>
                          <span className="badge badge-sm bg-primary-100 text-primary-700">
                            {question.type.replace('_', ' ')}
                          </span>
                        </div>
                        <textarea
                          value={question.question}
                          onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                          placeholder="Enter your question..."
                          className="input w-full min-h-[80px]"
                          rows={3}
                        />
                      </div>
                      <button
                        onClick={() => deleteQuestion(question.id)}
                        className="btn btn-ghost btn-sm text-danger-600 hover:bg-danger-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Multiple Choice Options */}
                    {question.type === 'multiple_choice' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-700">
                          Answer Options
                        </label>
                        {question.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correctAnswer === optIndex}
                              onChange={() => updateQuestion(question.id, { correctAnswer: optIndex })}
                              className="radio"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                              placeholder={`Option ${optIndex + 1}`}
                              className="input flex-1"
                            />
                            {question.options && question.options.length > 2 && (
                              <button
                                onClick={() => removeOption(question.id, optIndex)}
                                className="btn btn-ghost btn-sm text-danger-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(question.id)}
                          className="btn btn-sm btn-outline"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Option
                        </button>
                      </div>
                    )}

                    {/* True/False */}
                    {question.type === 'true_false' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-700">
                          Correct Answer
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`tf-${question.id}`}
                              value="true"
                              checked={question.correctAnswer === 'true'}
                              onChange={() => updateQuestion(question.id, { correctAnswer: 'true' })}
                              className="radio"
                            />
                            <span>True</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={`tf-${question.id}`}
                              value="false"
                              checked={question.correctAnswer === 'false'}
                              onChange={() => updateQuestion(question.id, { correctAnswer: 'false' })}
                              className="radio"
                            />
                            <span>False</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Fill in Blank */}
                    {question.type === 'fill_in_blank' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-neutral-700">
                          Correct Answer
                        </label>
                        <input
                          type="text"
                          value={question.correctAnswer as string || ''}
                          onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
                          placeholder="Enter the correct answer..."
                          className="input w-full"
                        />
                        <p className="text-xs text-neutral-500">Students must type this exact answer (case-insensitive)</p>
                      </div>
                    )}

                    {/* Points and Explanation */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Points
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 1 })}
                          className="input w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Explanation (Optional)
                      </label>
                      <textarea
                        value={question.explanation || ''}
                        onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                        placeholder="Explain the correct answer..."
                        className="input w-full"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {questions.length === 0 && (
              <div className="bg-white rounded-xl shadow-soft p-12 text-center">
                <FileText className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600">No questions added yet</p>
                <p className="text-sm text-neutral-500 mt-1">
                  Click the buttons above to add your first question
                </p>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-soft p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Quiz Title *
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                placeholder="e.g., Module 1 Quiz"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Description
              </label>
              <textarea
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                placeholder="Brief description of this quiz..."
                className="input w-full"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.timeLimit}
                  onChange={(e) => setSettings({ ...settings, timeLimit: parseInt(e.target.value) || 0 })}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.passingScore}
                  onChange={(e) => setSettings({ ...settings, passingScore: parseInt(e.target.value) || 0 })}
                  className="input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Maximum Attempts
              </label>
              <input
                type="number"
                min="1"
                value={settings.maxAttempts}
                onChange={(e) => setSettings({ ...settings, maxAttempts: parseInt(e.target.value) || 1 })}
                className="input w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.randomizeQuestions}
                  onChange={(e) => setSettings({ ...settings, randomizeQuestions: e.target.checked })}
                  className="checkbox"
                />
                <span className="text-sm">Randomize question order</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showCorrectAnswers}
                  onChange={(e) => setSettings({ ...settings, showCorrectAnswers: e.target.checked })}
                  className="checkbox"
                />
                <span className="text-sm">Show correct answers after submission</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizBuilder;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJob, useAssessment } from '../hooks';
import { useAppStore } from '../store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Question, QuestionType } from '../types';
import { 
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Upload
} from 'lucide-react';

interface AssessmentResponse {
  questionId: string;
  value: any;
}

interface AssessmentState {
  responses: Record<string, any>;
  currentQuestionIndex: number;
  timeRemaining: number;
  isSubmitted: boolean;
  startTime: number;
}

export const TakeAssessmentPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAppStore();
  const { data: job, isLoading: jobLoading } = useJob(jobId!);
  const { data: assessment, isLoading: assessmentLoading } = useAssessment(jobId!);
  
  const [assessmentState, setAssessmentState] = useState<AssessmentState>({
    responses: {},
    currentQuestionIndex: 0,
    timeRemaining: 0,
    isSubmitted: false,
    startTime: Date.now()
  });

  const [hasStarted, setHasStarted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isLoading = jobLoading || assessmentLoading;

  // Timer effect
  useEffect(() => {
    if (!hasStarted || !assessment?.timeLimit || assessmentState.isSubmitted) return;

    const interval = setInterval(() => {
      setAssessmentState(prev => {
        const elapsed = Math.floor((Date.now() - prev.startTime) / 1000);
        const remaining = (assessment.timeLimit! * 60) - elapsed;
        
        if (remaining <= 0) {
          handleSubmitAssessment(true); // Auto-submit when time runs out
          return { ...prev, timeRemaining: 0 };
        }
        
        return { ...prev, timeRemaining: remaining };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, assessment?.timeLimit, assessmentState.isSubmitted]);

  if (!jobId) {
    return <div>Invalid job ID</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!job || !assessment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            {!job ? 'Job not found' : 'Assessment not available for this job yet'}
          </div>
          <p className="text-gray-600 mb-4">
            {!job 
              ? 'The job you are looking for could not be found.' 
              : 'The assessment for this position is being prepared. Please check back later or contact the HR team.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/candidate-portal">
                Browse Jobs
              </Link>
            </Button>
            {job && (
              <Button variant="secondary" asChild>
                <Link to={`/candidate/jobs/${job.id}`}>
                  Back to Job Details
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const allQuestions = assessment.sections.flatMap(section => section.questions);
  const currentQuestion = allQuestions[assessmentState.currentQuestionIndex];
  const progress = ((assessmentState.currentQuestionIndex + 1) / allQuestions.length) * 100;

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartAssessment = () => {
    setHasStarted(true);
    setAssessmentState(prev => ({
      ...prev,
      startTime: Date.now(),
      timeRemaining: assessment.timeLimit ? assessment.timeLimit * 60 : 0
    }));
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAssessmentState(prev => ({
      ...prev,
      responses: {
        ...prev.responses,
        [questionId]: value
      }
    }));
    
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: '' }));
    }
  };

  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion.required) return true;
    
    const response = assessmentState.responses[currentQuestion.id];
    
    if (!response || (typeof response === 'string' && !response.trim())) {
      setErrors({ [currentQuestion.id]: 'This question is required' });
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) return;
    
    if (assessmentState.currentQuestionIndex < allQuestions.length - 1) {
      setAssessmentState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  };

  const handlePrevious = () => {
    if (assessmentState.currentQuestionIndex > 0) {
      setAssessmentState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };

  const handleSubmitAssessment = async (isAutoSubmit: boolean = false) => {
    // Validate all required questions
    const requiredQuestions = allQuestions.filter(q => q.required);
    const missingAnswers = requiredQuestions.filter(q => !assessmentState.responses[q.id]);
    
    if (missingAnswers.length > 0 && !isAutoSubmit) {
      const newErrors: Record<string, string> = {};
      missingAnswers.forEach(q => {
        newErrors[q.id] = 'This question is required';
      });
      setErrors(newErrors);
      
      // Navigate to first missing question
      const firstMissingIndex = allQuestions.findIndex(q => q.id === missingAnswers[0].id);
      setAssessmentState(prev => ({
        ...prev,
        currentQuestionIndex: firstMissingIndex
      }));
      return;
    }

    try {
      const responses: AssessmentResponse[] = Object.entries(assessmentState.responses).map(([questionId, value]) => ({
        questionId,
        value
      }));

      const submissionData = {
        assessmentId: assessment.id,
        jobId: job.id,
        candidateId: user?.id,
        candidateName: user?.name,
        candidateEmail: user?.email,
        responses,
        timeSpent: Math.floor((Date.now() - assessmentState.startTime) / 1000),
        completedAt: new Date().toISOString(),
        isAutoSubmit
      };

      console.log('Assessment submitted:', submissionData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAssessmentState(prev => ({ ...prev, isSubmitted: true }));
      
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      setErrors({ submit: 'Failed to submit assessment. Please try again.' });
    }
  };

  const renderQuestion = (question: Question) => {
    const response = assessmentState.responses[question.id];
    const hasError = !!errors[question.id];

    switch (question.type) {
      case 'single-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={response === option.value}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'multi-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={Array.isArray(response) && response.includes(option.value)}
                  onChange={(e) => {
                    const currentResponses = Array.isArray(response) ? response : [];
                    if (e.target.checked) {
                      handleAnswerChange(question.id, [...currentResponses, option.value]);
                    } else {
                      handleAnswerChange(question.id, currentResponses.filter(r => r !== option.value));
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'short-text':
        return (
          <Input
            value={response || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder || 'Enter your answer'}
            maxLength={question.maxLength}
            className={hasError ? 'border-red-300' : ''}
          />
        );

      case 'long-text':
        return (
          <textarea
            rows={6}
            value={response || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={question.placeholder || 'Enter your detailed answer'}
            maxLength={question.maxLength}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              hasError ? 'border-red-300' : 'border-gray-300'
            }`}
          />
        );

      case 'numeric':
        return (
          <Input
            type="number"
            value={response || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            min={question.min}
            max={question.max}
            step={question.step}
            className={hasError ? 'border-red-300' : ''}
          />
        );

      case 'file-upload':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="text-sm text-gray-600 mb-2">
              {response ? response.name : 'Upload a file'}
            </div>
            <input
              type="file"
              accept={question.acceptedTypes?.join(',')}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && question.maxSize && file.size > question.maxSize * 1024 * 1024) {
                  setErrors({ [question.id]: `File size must be less than ${question.maxSize}MB` });
                } else {
                  handleAnswerChange(question.id, file);
                }
              }}
              className="hidden"
              id={`file-${question.id}`}
            />
            <label htmlFor={`file-${question.id}`} className="cursor-pointer">
              <span className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Choose File
              </span>
            </label>
            {question.maxSize && (
              <p className="text-xs text-gray-500 mt-2">
                Max file size: {question.maxSize}MB
              </p>
            )}
          </div>
        );

      default:
        return <div>Question type not supported</div>;
    }
  };

  if (assessmentState.isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/candidate-dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Assessment Completed!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for completing the assessment for <strong>{job.title}</strong>. 
              Your responses have been submitted successfully.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>What's next?</strong> We'll review your assessment along with your application. 
                You'll be notified of the next steps within 3-5 business days.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/candidate-dashboard">
                  View My Applications
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/candidate-portal">
                  Browse More Jobs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center h-16">
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/candidate/jobs/${job.id}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Job
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {assessment.title}
              </h1>
              <p className="text-gray-600">
                Assessment for {job.title}
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium text-yellow-800 mb-2">Before you begin:</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Make sure you have a stable internet connection</li>
                      <li>• Find a quiet environment without distractions</li>
                      <li>• You cannot pause once you start the assessment</li>
                      {assessment.timeLimit && (
                        <li>• You have {assessment.timeLimit} minutes to complete</li>
                      )}
                      <li>• All questions marked with * are required</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="font-medium text-gray-900">Questions</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{allQuestions.length}</p>
                  <p className="text-sm text-gray-600">Total questions</p>
                </div>

                {assessment.timeLimit && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Clock className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="font-medium text-gray-900">Time Limit</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{assessment.timeLimit}</p>
                    <p className="text-sm text-gray-600">minutes</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <Button onClick={handleStartAssessment} size="lg">
                Start Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-medium text-gray-900">
                {assessment.title}
              </h1>
              <span className="text-sm text-gray-500">
                Question {assessmentState.currentQuestionIndex + 1} of {allQuestions.length}
              </span>
            </div>
            {assessment.timeLimit && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className={`text-sm font-medium ${
                  assessmentState.timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {formatTime(assessmentState.timeRemaining)}
                </span>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200">
            <div 
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Question */}
          <div className="mb-8">
            <div className="flex items-start gap-3 mb-4">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                {assessmentState.currentQuestionIndex + 1}
              </span>
              <div className="flex-1">
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  {currentQuestion.title}
                  {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
                </h2>
                {currentQuestion.description && (
                  <p className="text-gray-600 text-sm">{currentQuestion.description}</p>
                )}
              </div>
            </div>

            <div className="ml-11">
              {renderQuestion(currentQuestion)}
              {errors[currentQuestion.id] && (
                <p className="mt-2 text-sm text-red-600">{errors[currentQuestion.id]}</p>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={handlePrevious}
              disabled={assessmentState.currentQuestionIndex === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-3">
              {assessmentState.currentQuestionIndex === allQuestions.length - 1 ? (
                <Button onClick={() => handleSubmitAssessment(false)}>
                  Submit Assessment
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{errors.submit}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

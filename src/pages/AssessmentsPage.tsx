import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAssessment, useSaveAssessment, useJobs } from '../hooks';
import { Assessment, AssessmentSection } from '../types';
import { AssessmentBuilder } from '../components/assessments/AssessmentBuilder';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { HROnly } from '../components/ui/RoleBasedAccess';
import { Plus, FileText, Search, Edit, Eye } from 'lucide-react';

// Component for listing all assessments
const AssessmentsList: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { data: jobsData } = useJobs({ pageSize: 100 });
  const navigate = useNavigate();

  useEffect(() => {
    // Load all assessments from storage
    const loadAssessments = async () => {
      try {
        const { StorageService } = await import('../lib/storage');
        const allAssessments = await StorageService.getAllAssessments();
        setAssessments(allAssessments);
      } catch (error) {
        console.error('Failed to load assessments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssessments();
  }, []);

  const filteredAssessments = assessments.filter(assessment =>
    assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assessment.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getJobTitle = (jobId: string) => {
    const job = jobsData?.data?.find((j: any) => j.id === jobId);
    return job?.title || 'Unknown Job';
  };

  const createNewAssessment = () => {
    navigate('/assessments/new');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-600 mt-1">
            Manage and create assessments for your job positions
          </p>
        </div>
        <HROnly>
          <Button onClick={createNewAssessment}>
            <Plus className="w-4 h-4 mr-2" />
            Create Assessment
          </Button>
        </HROnly>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search assessments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Assessments List */}
      {filteredAssessments.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <div className="text-gray-500 mb-4">
            {searchQuery ? 'No assessments match your search' : 'No assessments created yet'}
          </div>
          {!searchQuery && (
            <Button onClick={createNewAssessment}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Assessment
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssessments.map((assessment) => (
            <div key={assessment.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {assessment.title || 'Untitled Assessment'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Job: {getJobTitle(assessment.jobId)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {assessment.sections.length} sections • {assessment.sections.reduce((total, section) => total + section.questions.length, 0)} questions
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    assessment.isPublished 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {assessment.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              
              {assessment.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {assessment.description}
                </p>
              )}

              <div className="flex items-center space-x-2">
                <Button
                  variant="primary"
                  size="sm"
                  asChild
                >
                  <Link to={`/assessments/${assessment.jobId}`}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                >
                  <Link to={`/assessments/${assessment.jobId}/preview`}>
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Component for creating/editing assessments
const AssessmentEditor: React.FC<{ jobId?: string }> = ({ jobId }) => {
  const { data: existingAssessment, isLoading, error } = useAssessment(jobId || '');
  const saveAssessmentMutation = useSaveAssessment();
  const { data: jobsData } = useJobs({ pageSize: 100 });
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [selectedJobId, setSelectedJobId] = useState(jobId || '');
  const navigate = useNavigate();

  // Initialize assessment when data loads or create new one
  useEffect(() => {
    if (existingAssessment) {
      setAssessment(existingAssessment);
      setSelectedJobId(existingAssessment.jobId);
    } else if (!isLoading) {
      // Create new assessment
      const newAssessment: Assessment = {
        id: crypto.randomUUID(),
        jobId: selectedJobId || '',
        title: '',
        description: '',
        sections: [],
        isPublished: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAssessment(newAssessment);
    }
  }, [existingAssessment, isLoading, selectedJobId]);

  const handleSaveAssessment = async () => {
    if (!assessment) return;

    // Update jobId if it was changed
    const updatedAssessment = {
      ...assessment,
      jobId: selectedJobId,
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveAssessmentMutation.mutateAsync({
        jobId: selectedJobId,
        assessment: updatedAssessment
      });
      
      // Navigate back to assessments list after successful save
      navigate('/assessments');
    } catch (error) {
      console.error('Failed to save assessment:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && jobId) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">Failed to load assessment</div>
        <p className="text-gray-500 text-sm">{error.toString()}</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Loading assessment...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job Selection for new assessments */}
      {!jobId && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Job Assignment</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Job Position *
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => {
                setSelectedJobId(e.target.value);
                setAssessment(prev => prev ? { ...prev, jobId: e.target.value } : null);
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a job position...</option>
              {jobsData?.data?.map((job: any) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.location}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <AssessmentBuilder
        assessment={assessment}
        onUpdate={setAssessment}
        onSave={handleSaveAssessment}
        isSaving={saveAssessmentMutation.isPending}
      />
    </div>
  );
};

export const AssessmentsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId?: string }>();

  // If jobId is 'new', show the editor for creating new assessment
  if (jobId === 'new') {
    return <AssessmentEditor />;
  }

  // If jobId is provided, show the editor for that specific job
  if (jobId) {
    return <AssessmentEditor jobId={jobId} />;
  }

  // Otherwise, show the assessments list
  return <AssessmentsList />;
};


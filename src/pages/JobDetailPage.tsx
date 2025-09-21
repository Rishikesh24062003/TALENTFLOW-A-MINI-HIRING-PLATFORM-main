import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJob, useUpdateJob } from '../hooks';
import { formatDate, formatCurrency } from '../utils';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { HROnly } from '../components/ui/RoleBasedAccess';
import { 
  ArrowLeft,
  Edit2,
  Archive,
  Users,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Settings,
  FileText,
  Plus,
  ExternalLink
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { data: job, isLoading, error } = useJob(jobId!);
  const updateJobMutation = useUpdateJob();

  if (!jobId) {
    return <div>Invalid job ID</div>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">Failed to load job</div>
        <p className="text-gray-500 text-sm">{error.toString()}</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Job not found</div>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800 border-green-200',
    archived: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const typeColors = {
    'full-time': 'bg-blue-100 text-blue-800',
    'part-time': 'bg-purple-100 text-purple-800',
    'contract': 'bg-orange-100 text-orange-800',
    'internship': 'bg-pink-100 text-pink-800'
  };

  const handleArchiveJob = async () => {
    try {
      await updateJobMutation.mutateAsync({
        id: job.id,
        updates: {
          status: job.status === 'active' ? 'archived' : 'active',
          updatedAt: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error('Failed to update job status:', error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/jobs"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-600">Job Details & Management</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link to={`/assessments/${job.id}`}>
            <Button variant="secondary">
              <Settings className="w-4 h-4 mr-2" />
              Manage Assessment
            </Button>
          </Link>
          <Button variant="secondary">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Job
          </Button>
          <Button
            variant="secondary"
            onClick={handleArchiveJob}
            loading={updateJobMutation.isPending}
          >
            <Archive className="w-4 h-4 mr-2" />
            {job.status === 'active' ? 'Archive' : 'Unarchive'}
          </Button>
        </div>
      </div>

      {/* Job Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[job.status]}`}>
                  {job.status}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[job.type]}`}>
                  {job.type}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Location</div>
                  <div className="font-medium">{job.location}</div>
                </div>
              </div>

              {job.salary && (
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Salary Range</div>
                    <div className="font-medium">
                      {formatCurrency(job.salary.min, job.salary.currency)} - {formatCurrency(job.salary.max, job.salary.currency)}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Posted</div>
                  <div className="font-medium">{formatDate(job.createdAt)}</div>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-3 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Last Updated</div>
                  <div className="font-medium">{formatDate(job.updatedAt)}</div>
                </div>
              </div>
            </div>

            {/* Skills & Tags */}
            {job.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full border border-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Stats */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Total Candidates</span>
                </div>
                <span className="font-semibold text-gray-900">25</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-green-400" />
                  <span className="text-sm text-gray-600">Hired</span>
                </div>
                <span className="font-semibold text-green-600">3</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-400" />
                  <span className="text-sm text-gray-600">Assessment</span>
                </div>
                <span className="text-sm text-gray-500">Available</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <HROnly>
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/candidates" className="block">
                  <Button variant="secondary" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    View All Candidates
                  </Button>
                </Link>
                
                <Link to={`/assessments/${job.id}`} className="block">
                  <Button variant="secondary" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Assessment
                  </Button>
                </Link>
                
                <Button variant="secondary" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Candidate
                </Button>
                
                <Button variant="secondary" className="w-full justify-start">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Share Job Posting
                </Button>
              </div>
            </div>
          </HROnly>

          {/* Job URL */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job URL</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <code className="text-sm text-gray-700 break-all">
                /jobs/{job.slug}
              </code>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This is the public URL for the job posting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


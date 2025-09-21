import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useJob } from '../hooks';
import { formatDate, formatCurrency } from '../utils';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { 
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Users,
  Building,
  Share2,
  BookmarkPlus,
  ExternalLink,
  CheckCircle,
  PlayCircle
} from 'lucide-react';

export const CandidateJobDetailPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { data: job, isLoading, error } = useJob(jobId!);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

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

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">Job not found</div>
          <Button asChild>
            <Link to="/candidate-portal">
              Back to Jobs
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const typeColors = {
    'full-time': 'bg-blue-100 text-blue-800',
    'part-time': 'bg-purple-100 text-purple-800',
    'contract': 'bg-orange-100 text-orange-800',
    'internship': 'bg-pink-100 text-pink-800'
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Here you would typically save to API or local storage
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const shareUrl = `${window.location.origin}/candidate/jobs/${job.id}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You could show a toast here
      setShowShareMenu(false);
    } catch (err) {
      console.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/candidate-portal">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Button variant="ghost" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ExternalLink className="mr-3 h-4 w-4" />
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBookmark}
                className={isBookmarked ? 'text-blue-600' : ''}
              >
                <BookmarkPlus className="h-4 w-4 mr-2" />
                {isBookmarked ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Posted {formatDate(job.createdAt)}
                    </div>
                    {job.salary && (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        {formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[job.type]}`}>
                      {job.type}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Apply Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Ready to apply?</h3>
                    <p className="text-sm text-gray-600">Submit your application in just a few clicks</p>
                  </div>
                  <Button asChild>
                    <Link to={`/candidate/jobs/${job.id}/apply`}>
                      Apply Now
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                <div className="whitespace-pre-wrap">{job.description}</div>
              </div>
            </div>

            {/* Skills & Requirements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills & Requirements</h2>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Assessment Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">Assessment Required</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This position requires completing a skills assessment as part of the application process. 
                    The assessment typically takes 30-45 minutes and will be available after you submit your application.
                  </p>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-800">
                      <strong>Note:</strong> You'll receive an email with assessment instructions within 24 hours of applying.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Application</h3>
              <div className="space-y-3">
                <Button className="w-full" asChild>
                  <Link to={`/candidate/jobs/${job.id}/apply`}>
                    <Users className="w-4 h-4 mr-2" />
                    Apply for this Job
                  </Link>
                </Button>
                <Button variant="secondary" className="w-full" onClick={handleBookmark}>
                  <BookmarkPlus className="w-4 h-4 mr-2" />
                  {isBookmarked ? 'Saved to Bookmarks' : 'Save for Later'}
                </Button>
              </div>
            </div>

            {/* Job Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Job Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Employment Type</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">{job.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Location</span>
                  <span className="text-sm font-medium text-gray-900">{job.location}</span>
                </div>
                {job.salary && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Salary Range</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(job.salary.min)} - {formatCurrency(job.salary.max)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Posted Date</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(job.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Application Deadline</span>
                  <span className="text-sm font-medium text-gray-900">No deadline</span>
                </div>
              </div>
            </div>

            {/* Related Jobs */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Related Jobs</h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Looking for similar opportunities?
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/candidate-portal">
                    Browse All Jobs
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

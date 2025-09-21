import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { useJobs } from '../hooks';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  CheckCircle,
  PlayCircle
} from 'lucide-react';

export const CandidatePortalPage: React.FC = () => {
  const { user, logout } = useAppStore();
  const navigate = useNavigate();
  const { data: jobsData, isLoading } = useJobs({ pageSize: 100 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Filter jobs based on search and location
  const filteredJobs = (jobsData?.data || []).filter((job: any) => {
    const matchesSearch = !searchQuery || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLocation = selectedLocation === 'all' || job.location === selectedLocation;
    
    return matchesSearch && matchesLocation && job.status === 'active';
  });

  // Get unique locations for filter
  const locations = ['all', ...Array.from(new Set((jobsData?.data || []).map((job: any) => job.location)))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center min-w-0">
              <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 truncate">TalentFlow</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:block text-sm text-gray-700 truncate">
                Welcome, {user?.name}
              </span>
              <Button variant="secondary" size="sm" className="hidden md:block" asChild>
                <Link to="/candidate-dashboard">
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="hidden md:block text-xs">
                <Link to="/force-reset">
                  Fix Assessments
                </Link>
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => {
                  logout();
                  navigate('/auth');
                }}
                className="text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 px-4">
            Find Your Dream Job
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 px-4">
            Discover opportunities that match your skills and ambitions
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-8">
          <div className="flex flex-col space-y-4">
            {/* Search Input */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search jobs by title, keywords, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
            
            {/* Location Filter */}
            <div className="w-full sm:w-auto">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Locations</option>
                {locations.slice(1).map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
            <span className="font-medium">{filteredJobs.length} jobs found</span>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="mr-2" />
                <span className="whitespace-nowrap">Remote jobs only</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="mr-2" />
                <span className="whitespace-nowrap">Entry level</span>
              </label>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-500 mb-4">
                {searchQuery ? 'No jobs match your search criteria' : 'No jobs available at the moment'}
              </div>
              {searchQuery && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedLocation('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            filteredJobs.map((job: any) => (
              <div key={job.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words overflow-wrap-anywhere">
                        {job.title}
                      </h3>
                      <span className="self-start sm:self-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full whitespace-nowrap">
                        {job.type}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="break-words overflow-wrap-anywhere">{job.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="whitespace-nowrap">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="whitespace-nowrap">${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2 break-words overflow-wrap-anywhere">
                      {job.description}
                    </p>

                    {/* Skills/Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags.slice(0, 5).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full break-words overflow-wrap-anywhere"
                        >
                          {tag}
                        </span>
                      ))}
                      {job.tags.length > 5 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          +{job.tags.length - 5} more
                        </span>
                      )}
                    </div>

                    {/* Assessment status - Mobile */}
                    <div className="lg:hidden mb-4">
                      <Link to={`/candidate/jobs/${job.id}/assessment`} className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800">
                        <PlayCircle className="w-3 h-3 mr-1" />
                        Take Assessment
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:ml-6 w-full sm:w-auto lg:w-auto">
                    <Button asChild className="w-full sm:w-auto">
                      <Link to={`/candidate/jobs/${job.id}/apply`}>
                        Apply Now
                      </Link>
                    </Button>
                    <Button variant="secondary" asChild className="w-full sm:w-auto">
                      <Link to={`/candidate/jobs/${job.id}`}>
                        View Details
                      </Link>
                    </Button>
                    
                    {/* Assessment status - Desktop */}
                    <div className="hidden lg:block text-center mt-2">
                      <Link to={`/candidate/jobs/${job.id}/assessment`} className="inline-flex items-center justify-center text-xs text-blue-600 hover:text-blue-800">
                        <PlayCircle className="w-3 h-3 mr-1" />
                        Take Assessment
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-center">
            <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{filteredJobs.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Active Job Openings</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-center">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-gray-900">1,250+</div>
            <div className="text-xs sm:text-sm text-gray-600">Candidates Hired</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 text-center sm:col-span-2 lg:col-span-1">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-xl sm:text-2xl font-bold text-gray-900">85%</div>
            <div className="text-xs sm:text-sm text-gray-600">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

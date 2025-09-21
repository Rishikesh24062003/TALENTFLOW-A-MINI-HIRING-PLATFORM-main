import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Job, JobFilters } from '../../types';
import { useJobs, useReorderJobs } from '../../hooks';
import { useJobsStore, useUIStore } from '../../store';
import { HROnly } from '../ui/RoleBasedAccess';
import { formatDate, formatCurrency } from '../../utils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Archive, 
  GripVertical,
  MapPin,
  Clock,
  DollarSign,
  Users
} from 'lucide-react';

interface SortableJobItemProps {
  job: Job;
  onEdit: (job: Job) => void;
  onArchive: (job: Job) => void;
}

const SortableJobItem: React.FC<SortableJobItemProps> = ({ job, onEdit, onArchive }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
        isDragging ? 'z-50 shadow-lg' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {/* Drag Handle */}
          <div 
            {...attributes} 
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Job Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2 gap-4">
              <h3 className="text-lg font-semibold text-gray-900 break-words overflow-wrap-anywhere flex-1 min-w-0">
                {job.title}
              </h3>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className={`px-2 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${statusColors[job.status]}`}>
                  {job.status}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${typeColors[job.type]}`}>
                  {job.type}
                </span>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2 break-words overflow-wrap-anywhere">
              {job.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mb-3">
              <div className="flex items-center space-x-1 min-w-0">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="break-words overflow-wrap-anywhere">{job.location}</span>
              </div>
              {job.salary && (
                <div className="flex items-center space-x-1 min-w-0">
                  <DollarSign className="w-4 h-4 flex-shrink-0" />
                  <span className="break-words overflow-wrap-anywhere">
                    {formatCurrency(job.salary.min, job.salary.currency)} - {formatCurrency(job.salary.max, job.salary.currency)}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Posted {formatDate(job.createdAt)}</span>
              </div>
            </div>

            {/* Tags */}
            {job.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {job.tags.slice(0, 6).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md break-words overflow-wrap-anywhere max-w-full"
                  >
                    {tag}
                  </span>
                ))}
                {job.tags.length > 6 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md">
                    +{job.tags.length - 6} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative ml-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
          {/* Dropdown menu would be implemented here */}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>25 candidates</span> {/* This would come from actual data */}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(job)}
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onArchive(job)}
            className={job.status === 'archived' ? 'hidden' : ''}
          >
            <Archive className="w-4 h-4 mr-1" />
            Archive
          </Button>
        </div>
      </div>
    </div>
  );
};

interface JobsListProps {
  className?: string;
}

export const JobsList: React.FC<JobsListProps> = ({ className = '' }) => {
  const { openModal } = useUIStore();
  const { jobs, filters, pagination, setFilters, setPagination } = useJobsStore();
  const reorderJobsMutation = useReorderJobs();
  
  const [searchQuery, setSearchQuery] = useState(filters.search);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'archived'>(filters.status);
  const [showFilters, setShowFilters] = useState(false);

  // Use current filters to fetch jobs
  const { isLoading, error } = useJobs({
    search: filters.search,
    status: filters.status === 'all' ? undefined : filters.status,
    page: pagination.page,
    pageSize: pagination.pageSize,
    sort: filters.sort,
    sortDirection: filters.sortDirection,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredJobs = useMemo(() => {
    console.log('🔍 JobsList: Filtering', jobs?.length || 0, 'jobs from store');
    
    let filtered = [...(jobs || [])];

    // Client-side search for real-time filtering
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    console.log('🔍 JobsList: Displaying', filtered.length, 'filtered jobs');
    return filtered;
  }, [jobs, searchQuery]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredJobs.findIndex(job => job.id === active.id);
      const newIndex = filteredJobs.findIndex(job => job.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const fromOrder = filteredJobs[oldIndex].order;
        const toOrder = filteredJobs[newIndex].order;
        
        try {
          await reorderJobsMutation.mutateAsync({ fromOrder, toOrder });
        } catch (error) {
          console.error('Failed to reorder jobs:', error);
        }
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Debounced search would update filters
    setFilters({ search: query });
    // Reset pagination when searching
    setPagination({ page: 1 });
  };

  const handleStatusFilter = (status: 'all' | 'active' | 'archived') => {
    setSelectedStatus(status);
    setFilters({ status });
    // Reset pagination when filtering
    setPagination({ page: 1 });
  };

  const handleCreateJob = () => {
    openModal('jobForm', {});
  };

  const handleEditJob = (job: Job) => {
    openModal('jobForm', { job });
  };

  const handleArchiveJob = (job: Job) => {
    openModal('deleteConfirm', { 
      type: 'job', 
      id: job.id,
      title: `Archive "${job.title}"?`,
      message: 'This will archive the job and hide it from active listings.'
    });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">Failed to load jobs</div>
        <p className="text-gray-500 text-sm">{error.toString()}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600 mt-1">
            Manage your job listings and candidates
          </p>
        </div>
        <HROnly>
          <Button onClick={handleCreateJob}>
            <Plus className="w-4 h-4 mr-2" />
            Create Job
          </Button>
        </HROnly>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search jobs by title, description, location, or tags..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusFilter(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
            <div className="text-sm text-gray-500">Total Jobs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {(jobs || []).filter(j => j.status === 'active').length}
            </div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-600">
              {(jobs || []).filter(j => j.status === 'archived').length}
            </div>
            <div className="text-sm text-gray-500">Archived</div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
          <div className="ml-4">Loading jobs...</div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {searchQuery ? 'No jobs match your search' : 'No jobs found'}
          </div>
          {!searchQuery && (
            <Button onClick={handleCreateJob}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Job
            </Button>
          )}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={filteredJobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <SortableJobItem
                  key={job.id}
                  job={job}
                  onEdit={handleEditJob}
                  onArchive={handleArchiveJob}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} jobs
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPagination({ page: pagination.page - 1 })}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination({ page: pagination.page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

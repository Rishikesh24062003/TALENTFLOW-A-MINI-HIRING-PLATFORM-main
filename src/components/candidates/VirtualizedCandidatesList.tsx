import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Candidate, CandidateStage } from '../../types';
import { useCandidates } from '../../hooks';
import { useCandidatesStore } from '../../store';
import { formatDate, formatTimeAgo } from '../../utils';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { 
  Search, 
  Filter, 
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface CandidateItemProps {
  candidate: Candidate;
  style?: React.CSSProperties;
}

const CandidateItem: React.FC<CandidateItemProps> = ({ candidate, style }) => {
  const stageColors: Record<CandidateStage, string> = {
    applied: 'bg-blue-100 text-blue-800 border-blue-200',
    screen: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    tech: 'bg-purple-100 text-purple-800 border-purple-200',
    offer: 'bg-orange-100 text-orange-800 border-orange-200',
    hired: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200'
  };

  const stageLabels: Record<CandidateStage, string> = {
    applied: 'Applied',
    screen: 'Phone Screen',
    tech: 'Technical Interview',
    offer: 'Offer Extended',
    hired: 'Hired',
    rejected: 'Rejected'
  };

  return (
    <div style={style} className="px-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {candidate.name}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${stageColors[candidate.stage]}`}>
                {stageLabels[candidate.stage]}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{candidate.email}</span>
              </div>
              
              {candidate.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{candidate.phone}</span>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Applied {formatTimeAgo(candidate.createdAt)}</span>
              </div>
            </div>

            {/* Timeline Preview */}
            {candidate.timeline.length > 0 && (
              <div className="text-xs text-gray-500">
                Last update: {formatTimeAgo(candidate.timeline[candidate.timeline.length - 1].createdAt)}
              </div>
            )}
          </div>

          <div className="ml-4 flex items-center space-x-2">
            <Link 
              to={`/candidates/${candidate.id}`}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Notes count */}
        {candidate.notes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              {candidate.notes.length} note{candidate.notes.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface VirtualizedCandidatesListProps {
  className?: string;
}

export const VirtualizedCandidatesList: React.FC<VirtualizedCandidatesListProps> = ({ 
  className = '' 
}) => {
  const { candidates, filters, setFilters } = useCandidatesStore();
  const [searchQuery, setSearchQuery] = useState(filters.search);
  const [selectedStage, setSelectedStage] = useState<CandidateStage | 'all'>(filters.stage || 'all');
  const [showFilters, setShowFilters] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null);

  // Use current filters to fetch candidates - load all like Kanban does
  const { isLoading, error } = useCandidates({
    page: 1,
    pageSize: 1000, // Load all for virtualization
  });


  // Client-side filtering for real-time search
  const filteredCandidates = useMemo(() => {
    let filtered = [...(candidates || [])];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(query) ||
        candidate.email.toLowerCase().includes(query) ||
        (candidate.phone && candidate.phone.includes(query))
      );
    }

    // Stage filter
    if (selectedStage !== 'all') {
      filtered = filtered.filter(candidate => candidate.stage === selectedStage);
    }

    return filtered;
  }, [candidates, searchQuery, selectedStage]);

  const virtualizer = useVirtualizer({
    count: filteredCandidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140, // Estimated height of each item
    overscan: 10, // Render extra items for smooth scrolling
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleStageFilter = (stage: CandidateStage | 'all') => {
    setSelectedStage(stage);
    setFilters({ stage: stage === 'all' ? 'all' : stage });
  };

  const stageOptions: { value: CandidateStage | 'all'; label: string; count: number }[] = [
    { value: 'all', label: 'All Stages', count: (candidates || []).length },
    { value: 'applied', label: 'Applied', count: (candidates || []).filter(c => c.stage === 'applied').length },
    { value: 'screen', label: 'Phone Screen', count: (candidates || []).filter(c => c.stage === 'screen').length },
    { value: 'tech', label: 'Technical', count: (candidates || []).filter(c => c.stage === 'tech').length },
    { value: 'offer', label: 'Offer', count: (candidates || []).filter(c => c.stage === 'offer').length },
    { value: 'hired', label: 'Hired', count: (candidates || []).filter(c => c.stage === 'hired').length },
    { value: 'rejected', label: 'Rejected', count: (candidates || []).filter(c => c.stage === 'rejected').length },
  ];

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">Failed to load candidates</div>
        <p className="text-gray-500 text-sm">{error.toString()}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>

      {/* Header */}
      <div className="flex-shrink-0 space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
            <p className="text-gray-600 mt-1">
              {filteredCandidates.length} of {(candidates || []).length} candidates
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search candidates by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {stageOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStageFilter(option.value)}
                  className={`p-2 text-sm rounded-md border transition-colors ${
                    selectedStage === option.value
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs opacity-75">{option.count}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Virtualized List */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="text-gray-500 mb-2">
              {searchQuery ? 'No candidates match your search' : 'No candidates found'}
            </div>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                }}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div
            ref={parentRef}
            className="overflow-auto"
            style={{ 
              height: '600px', // Fixed height for virtualizer to work
              contain: 'strict' 
            }}
          >
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const candidate = filteredCandidates[virtualItem.index];
                  if (!candidate) {
                    return null;
                  }
                  return (
                    <CandidateItem
                      key={candidate.id}
                      candidate={candidate}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    />
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Performance Info */}
      {filteredCandidates.length > 0 && (
        <div className="flex-shrink-0 mt-4 text-xs text-gray-500 text-center">
          Showing {virtualizer.getVirtualItems().length} of {filteredCandidates.length} items
          {filteredCandidates.length !== (candidates || []).length && ` (filtered from ${(candidates || []).length} total)`}
        </div>
      )}
    </div>
  );
};

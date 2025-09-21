import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
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
import { Candidate, CandidateStage } from '../../types';
import { useCandidates, useUpdateCandidate } from '../../hooks';
import { useCandidatesStore } from '../../store';
import { formatTimeAgo } from '../../utils';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { 
  User,
  Mail,
  Phone,
  Calendar,
  Plus,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SortableCandidateCardProps {
  candidate: Candidate;
}

const SortableCandidateCard: React.FC<SortableCandidateCardProps> = ({ candidate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: candidate.id,
    data: {
      type: 'candidate',
      candidate,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">
            {candidate.name}
          </h4>
          <p className="text-sm text-gray-600 truncate">
            {candidate.email}
          </p>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Link 
            to={`/candidates/${candidate.id}`}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <MoreVertical className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="space-y-1 text-xs text-gray-500">
        {candidate.phone && (
          <div className="flex items-center">
            <Phone className="w-3 h-3 mr-1" />
            <span className="truncate">{candidate.phone}</span>
          </div>
        )}
        <div className="flex items-center">
          <Calendar className="w-3 h-3 mr-1" />
          <span>Applied {formatTimeAgo(candidate.createdAt)}</span>
        </div>
      </div>

      {candidate.notes.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            {candidate.notes.length} note{candidate.notes.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

interface DroppableColumnProps {
  stage: CandidateStage;
  title: string;
  candidates: Candidate[];
  color: string;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ 
  stage, 
  title, 
  candidates, 
  color 
}) => {
  return (
    <div className="flex-1 min-w-0">
      <div className="bg-gray-50 rounded-lg">
        {/* Column Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <h3 className="font-medium text-gray-900">{title}</h3>
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                {candidates.length}
              </span>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Column Content */}
        <div className="p-4 space-y-3 min-h-[600px]">
          <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {candidates.map((candidate) => (
              <SortableCandidateCard key={candidate.id} candidate={candidate} />
            ))}
          </SortableContext>
          
          {candidates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No candidates</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface KanbanBoardProps {
  className?: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ className = '' }) => {
  const { candidates } = useCandidatesStore();
  const updateCandidateMutation = useUpdateCandidate();
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);

  // Use current filters to fetch candidates
  const { isLoading, error } = useCandidates({
    page: 1,
    pageSize: 1000, // Load all for kanban
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Allow small movements before starting drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const stages: Array<{
    stage: CandidateStage;
    title: string;
    color: string;
  }> = [
    { stage: 'applied', title: 'Applied', color: 'bg-blue-500' },
    { stage: 'screen', title: 'Phone Screen', color: 'bg-yellow-500' },
    { stage: 'tech', title: 'Technical Interview', color: 'bg-purple-500' },
    { stage: 'offer', title: 'Offer Extended', color: 'bg-orange-500' },
    { stage: 'hired', title: 'Hired', color: 'bg-green-500' },
    { stage: 'rejected', title: 'Rejected', color: 'bg-red-500' },
  ];

  const candidatesByStage = React.useMemo(() => {
    return stages.reduce((acc, { stage }) => {
      acc[stage] = (candidates || []).filter(candidate => candidate.stage === stage);
      return acc;
    }, {} as Record<CandidateStage, Candidate[]>);
  }, [candidates, stages]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const candidate = (candidates || []).find(c => c.id === active.id);
    setActiveCandidate(candidate || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeCandidate = (candidates || []).find(c => c.id === active.id);
    if (!activeCandidate) return;

    // Find the stage from the over id (could be a candidate or a stage)
    let targetStage: CandidateStage | null = null;
    
    // Check if dropping over another candidate
    const overCandidate = (candidates || []).find(c => c.id === over.id);
    if (overCandidate) {
      targetStage = overCandidate.stage;
    } else {
      // Check if dropping over a stage area (you'd need to implement stage drop zones)
      // For now, we'll handle this in handleDragEnd
    }

    if (targetStage && targetStage !== activeCandidate.stage) {
      // Optimistically update the candidate's stage
      // The actual update will happen in handleDragEnd
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCandidate(null);

    if (!over) return;

    const activeCandidate = (candidates || []).find(c => c.id === active.id);
    if (!activeCandidate) return;

    let targetStage: CandidateStage | null = null;

    // Check if dropping over another candidate
    const overCandidate = (candidates || []).find(c => c.id === over.id);
    if (overCandidate) {
      targetStage = overCandidate.stage;
    } else {
      // Handle dropping over stage areas
      const stageMatch = over.id.toString().match(/^stage-(.+)$/);
      if (stageMatch) {
        targetStage = stageMatch[1] as CandidateStage;
      }
    }

    if (targetStage && targetStage !== activeCandidate.stage) {
      try {
        // Create timeline event for stage change
        const newTimelineEvent = {
          id: crypto.randomUUID(),
          type: 'stage_change' as const,
          description: `Moved from ${activeCandidate.stage} to ${targetStage}`,
          previousStage: activeCandidate.stage,
          newStage: targetStage,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await updateCandidateMutation.mutateAsync({
          id: activeCandidate.id,
          updates: {
            stage: targetStage,
            timeline: [...activeCandidate.timeline, newTimelineEvent],
            updatedAt: new Date().toISOString(),
          }
        });
      } catch (error) {
        console.error('Failed to update candidate stage:', error);
      }
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-2">Failed to load candidates</div>
        <p className="text-gray-500 text-sm">{error.toString()}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={className}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {stages.map(({ stage, title, color }) => (
            <DroppableColumn
              key={stage}
              stage={stage}
              title={title}
              candidates={candidatesByStage[stage] || []}
              color={color}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCandidate ? (
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg rotate-3">
              <div className="font-medium text-gray-900">
                {activeCandidate.name}
              </div>
              <div className="text-sm text-gray-600">
                {activeCandidate.email}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

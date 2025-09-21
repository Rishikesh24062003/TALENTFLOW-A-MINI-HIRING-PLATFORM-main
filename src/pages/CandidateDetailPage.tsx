import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCandidate, useUpdateCandidate } from '../hooks';
import { Candidate, CandidateStage, CandidateTimelineEvent } from '../types';
import { formatDate, formatTimeAgo } from '../utils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Plus,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Download,
  Edit2
} from 'lucide-react';

interface TimelineItemProps {
  event: CandidateTimelineEvent;
  isLast: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event, isLast }) => {
  const getEventIcon = () => {
    switch (event.type) {
      case 'stage_change':
        return <ArrowRight className="w-4 h-4" />;
      case 'note_added':
        return <FileText className="w-4 h-4" />;
      case 'assessment_completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'interview_scheduled':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getEventColor = () => {
    switch (event.type) {
      case 'stage_change':
        return 'bg-blue-500 text-white';
      case 'note_added':
        return 'bg-gray-500 text-white';
      case 'assessment_completed':
        return 'bg-green-500 text-white';
      case 'interview_scheduled':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="flex items-start space-x-4">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getEventColor()}`}>
          {getEventIcon()}
        </div>
        {!isLast && <div className="w-px h-6 bg-gray-300 mt-2" />}
      </div>

      {/* Event content */}
      <div className="flex-1 pb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-900 font-medium">
                {event.description}
              </p>
              {event.previousStage && event.newStage && (
                <p className="text-xs text-gray-500 mt-1">
                  From {event.previousStage} to {event.newStage}
                </p>
              )}
            </div>
            <div className="text-xs text-gray-500 ml-4">
              {formatTimeAgo(event.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StageChangeButtonsProps {
  currentStage: CandidateStage;
  onStageChange: (newStage: CandidateStage) => void;
  isUpdating: boolean;
}

const StageChangeButtons: React.FC<StageChangeButtonsProps> = ({ 
  currentStage, 
  onStageChange, 
  isUpdating 
}) => {
  const stageFlow: CandidateStage[] = ['applied', 'screen', 'tech', 'offer', 'hired'];
  const currentIndex = stageFlow.indexOf(currentStage);
  
  const canMoveForward = currentIndex < stageFlow.length - 1 && currentStage !== 'rejected';
  const canMoveBackward = currentIndex > 0;
  const canReject = currentStage !== 'rejected' && currentStage !== 'hired';

  return (
    <div className="flex flex-wrap gap-2">
      {canMoveBackward && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onStageChange(stageFlow[currentIndex - 1])}
          disabled={isUpdating}
        >
          Move to {stageFlow[currentIndex - 1]}
        </Button>
      )}
      
      {canMoveForward && (
        <Button
          variant="primary"
          size="sm"
          onClick={() => onStageChange(stageFlow[currentIndex + 1])}
          disabled={isUpdating}
        >
          Move to {stageFlow[currentIndex + 1]}
        </Button>
      )}
      
      {canReject && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onStageChange('rejected')}
          disabled={isUpdating}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <XCircle className="w-4 h-4 mr-1" />
          Reject
        </Button>
      )}
    </div>
  );
};

export const CandidateDetailPage: React.FC = () => {
  const { candidateId } = useParams<{ candidateId: string }>();
  const { data: candidate, isLoading, error } = useCandidate(candidateId!);
  const updateCandidateMutation = useUpdateCandidate();
  
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  if (!candidateId) {
    return <div>Invalid candidate ID</div>;
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
        <div className="text-red-600 mb-2">Failed to load candidate</div>
        <p className="text-gray-500 text-sm">{error.toString()}</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Candidate not found</div>
      </div>
    );
  }

  const handleStageChange = async (newStage: CandidateStage) => {
    try {
      const newTimelineEvent: CandidateTimelineEvent = {
        id: crypto.randomUUID(),
        type: 'stage_change',
        description: `Stage changed from ${candidate.stage} to ${newStage}`,
        previousStage: candidate.stage,
        newStage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await updateCandidateMutation.mutateAsync({
        id: candidate.id,
        updates: {
          stage: newStage,
          timeline: [...candidate.timeline, newTimelineEvent],
          updatedAt: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error('Failed to update candidate stage:', error);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setIsAddingNote(true);

      const newNoteObj = {
        id: crypto.randomUUID(),
        content: newNote,
        authorId: 'current-user', // Would come from auth context
        authorName: 'HR Manager', // Would come from auth context
        mentions: [], // Would parse @mentions from content
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newTimelineEvent: CandidateTimelineEvent = {
        id: crypto.randomUUID(),
        type: 'note_added',
        description: 'Note added',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await updateCandidateMutation.mutateAsync({
        id: candidate.id,
        updates: {
          notes: [...candidate.notes, newNoteObj],
          timeline: [...candidate.timeline, newTimelineEvent],
          updatedAt: new Date().toISOString(),
        }
      });

      setNewNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setIsAddingNote(false);
    }
  };

  const stageColors: Record<CandidateStage, string> = {
    applied: 'bg-blue-100 text-blue-800 border-blue-200',
    screen: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    tech: 'bg-purple-100 text-purple-800 border-purple-200',
    offer: 'bg-orange-100 text-orange-800 border-orange-200',
    hired: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link 
          to="/candidates"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Candidate Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Candidate Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{candidate.name}</h2>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${stageColors[candidate.stage]}`}>
                  {candidate.stage}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-3 text-gray-400" />
                <span>{candidate.email}</span>
              </div>
              
              {candidate.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-3 text-gray-400" />
                  <span>{candidate.phone}</span>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                <span>Applied {formatDate(candidate.createdAt)}</span>
              </div>

              {candidate.resumeUrl && (
                <div className="pt-3 border-t border-gray-100">
                  <Button variant="secondary" size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Resume
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Stage Management */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Stage</h3>
            <StageChangeButtons
              currentStage={candidate.stage}
              onStageChange={handleStageChange}
              isUpdating={updateCandidateMutation.isPending}
            />
          </div>

          {/* Notes */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
            
            {/* Add Note */}
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this candidate..."
                className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  Use @mentions to notify team members
                </span>
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isAddingNote}
                  loading={isAddingNote}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Add Note
                </Button>
              </div>
            </div>

            {/* Existing Notes */}
            <div className="space-y-3">
              {candidate.notes.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No notes yet
                </p>
              ) : (
                candidate.notes.map((note) => (
                  <div key={note.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {note.authorName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Timeline</h3>
            
            {candidate.timeline.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No timeline events yet
              </p>
            ) : (
              <div className="space-y-0">
                {candidate.timeline
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((event, index) => (
                    <TimelineItem
                      key={event.id}
                      event={event}
                      isLast={index === candidate.timeline.length - 1}
                    />
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
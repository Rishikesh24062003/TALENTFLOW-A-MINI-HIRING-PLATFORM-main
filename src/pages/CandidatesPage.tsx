import React, { useState } from 'react';
import { VirtualizedCandidatesList } from '../components/candidates/VirtualizedCandidatesList';
import { KanbanBoard } from '../components/candidates/KanbanBoard';
import { Button } from '../components/ui/Button';
import { List, LayoutGrid } from 'lucide-react';

type ViewMode = 'list' | 'kanban';

export const CandidatesPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  return (
    <div className="h-full flex flex-col">
      {/* Header with View Toggle */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
            <p className="text-gray-600 mt-1">
              Manage candidates and track their progress through the hiring pipeline
            </p>
          </div>
          
          <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
            <Button
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? '' : 'bg-transparent border-0 text-gray-600 hover:text-gray-900'}
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className={viewMode === 'kanban' ? '' : 'bg-transparent border-0 text-gray-600 hover:text-gray-900'}
            >
              <LayoutGrid className="w-4 h-4 mr-1" />
              Kanban
            </Button>
          </div>
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 min-h-0">
        {viewMode === 'list' ? (
          <VirtualizedCandidatesList className="h-full" />
        ) : (
          <div className="h-full overflow-hidden">
            <KanbanBoard className="h-full" />
          </div>
        )}
      </div>
    </div>
  );
};


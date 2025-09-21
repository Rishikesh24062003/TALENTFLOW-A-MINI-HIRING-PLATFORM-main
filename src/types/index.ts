// Base entity types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Job types
export interface Job extends BaseEntity {
  title: string;
  slug: string;
  description: string;
  status: 'active' | 'archived';
  tags: string[];
  order: number;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface JobFilters {
  search?: string;
  status?: 'active' | 'archived' | 'all';
  tags?: string[];
  page?: number;
  pageSize?: number;
  sort?: 'title' | 'createdAt' | 'order';
  sortDirection?: 'asc' | 'desc';
}

// Candidate types
export type CandidateStage = 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';

export interface Candidate extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  stage: CandidateStage;
  jobId: string;
  avatar?: string;
  notes: CandidateNote[];
  timeline: CandidateTimelineEvent[];
}

export interface CandidateNote extends BaseEntity {
  content: string;
  authorId: string;
  authorName: string;
  mentions: string[];
}

export interface CandidateTimelineEvent extends BaseEntity {
  type: 'stage_change' | 'note_added' | 'assessment_completed' | 'interview_scheduled';
  description: string;
  previousStage?: CandidateStage;
  newStage?: CandidateStage;
  metadata?: Record<string, any>;
}

export interface CandidateFilters {
  search?: string;
  stage?: CandidateStage | 'all';
  jobId?: string;
  page?: number;
  pageSize?: number;
}

// Assessment types
export type QuestionType = 'single-choice' | 'multi-choice' | 'short-text' | 'long-text' | 'numeric' | 'file-upload';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  conditionalLogic?: {
    dependsOn: string; // question id
    condition: 'equals' | 'not_equals' | 'contains';
    value: any;
  };
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single-choice';
  options: {
    id: string;
    label: string;
    value: string;
  }[];
}

export interface MultiChoiceQuestion extends BaseQuestion {
  type: 'multi-choice';
  options: {
    id: string;
    label: string;
    value: string;
  }[];
  maxSelections?: number;
}

export interface ShortTextQuestion extends BaseQuestion {
  type: 'short-text';
  maxLength?: number;
  placeholder?: string;
}

export interface LongTextQuestion extends BaseQuestion {
  type: 'long-text';
  maxLength?: number;
  placeholder?: string;
}

export interface NumericQuestion extends BaseQuestion {
  type: 'numeric';
  min?: number;
  max?: number;
  step?: number;
}

export interface FileUploadQuestion extends BaseQuestion {
  type: 'file-upload';
  acceptedTypes: string[];
  maxSize: number; // in MB
}

export type Question = 
  | SingleChoiceQuestion 
  | MultiChoiceQuestion 
  | ShortTextQuestion 
  | LongTextQuestion 
  | NumericQuestion 
  | FileUploadQuestion;

export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: Question[];
}

export interface Assessment extends BaseEntity {
  jobId: string;
  title: string;
  description?: string;
  sections: AssessmentSection[];
  isPublished: boolean;
  timeLimit?: number; // in minutes
}

export interface AssessmentResponse extends BaseEntity {
  assessmentId: string;
  candidateId: string;
  jobId: string;
  answers: {
    questionId: string;
    value: any;
  }[];
  completedAt?: string;
  timeSpent: number; // in seconds
  score?: number;
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// MirageJS specific response type (combines success flag with pagination)
export interface MirageResponse<T> extends PaginatedResponse<T> {
  success: boolean;
  message?: string;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'multiselect' | 'number' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

// Drag and drop types
export interface DragItem {
  id: string;
  type: string;
  index: number;
}

export interface DropResult {
  draggedId: string;
  targetId?: string;
  position: 'before' | 'after';
}


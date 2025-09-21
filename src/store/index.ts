import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Job, Candidate, Assessment, Toast, LoadingState } from '@/types';

// Jobs store
interface JobsState {
  jobs: Job[];
  currentJob: Job | null;
  loading: LoadingState;
  filters: {
    search: string;
    status: 'all' | 'active' | 'archived';
    tags: string[];
    sort: 'title' | 'createdAt' | 'order';
    sortDirection: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface JobsActions {
  setJobs: (jobs: Job[]) => void;
  setCurrentJob: (job: Job | null) => void;
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  removeJob: (id: string) => void;
  setLoading: (loading: LoadingState) => void;
  setFilters: (filters: Partial<JobsState['filters']>) => void;
  setPagination: (pagination: Partial<JobsState['pagination']>) => void;
  resetFilters: () => void;
}

export const useJobsStore = create<JobsState & JobsActions>()(
  devtools(
    (set, get) => ({
      // State
      jobs: [],
      currentJob: null,
      loading: { isLoading: false },
      filters: {
        search: '',
        status: 'all',
        tags: [],
        sort: 'order',
        sortDirection: 'asc',
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      },

      // Actions
      setJobs: (jobs) => set({ jobs: Array.isArray(jobs) ? jobs : [] }),
      setCurrentJob: (job) => set({ currentJob: job }),
      addJob: (job) => set((state) => ({ jobs: [...(state.jobs || []), job] })),
      updateJob: (id, updates) =>
        set((state) => ({
          jobs: (state.jobs || []).map((job) => (job.id === id ? { ...job, ...updates } : job)),
          currentJob: state.currentJob?.id === id ? { ...state.currentJob, ...updates } : state.currentJob,
        })),
      removeJob: (id) =>
        set((state) => ({
          jobs: (state.jobs || []).filter((job) => job.id !== id),
          currentJob: state.currentJob?.id === id ? null : state.currentJob,
        })),
      setLoading: (loading) => set({ loading }),
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
      setPagination: (pagination) => set((state) => ({ pagination: { ...state.pagination, ...pagination } })),
      resetFilters: () =>
        set({
          filters: {
            search: '',
            status: 'all',
            tags: [],
            sort: 'order',
            sortDirection: 'asc',
          },
          pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
        }),
    }),
    { name: 'jobs-store' }
  )
);

// Candidates store
interface CandidatesState {
  candidates: Candidate[];
  currentCandidate: Candidate | null;
  loading: LoadingState;
  filters: {
    search: string;
    stage: 'all' | 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
    jobId: string;
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

interface CandidatesActions {
  setCandidates: (candidates: Candidate[]) => void;
  setCurrentCandidate: (candidate: Candidate | null) => void;
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  removeCandidate: (id: string) => void;
  setLoading: (loading: LoadingState) => void;
  setFilters: (filters: Partial<CandidatesState['filters']>) => void;
  setPagination: (pagination: Partial<CandidatesState['pagination']>) => void;
  resetFilters: () => void;
}

export const useCandidatesStore = create<CandidatesState & CandidatesActions>()(
  devtools(
    (set, get) => ({
      // State
      candidates: [],
      currentCandidate: null,
      loading: { isLoading: false },
      filters: {
        search: '',
        stage: 'all',
        jobId: '',
      },
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0,
        totalPages: 0,
      },

      // Actions
      setCandidates: (candidates) => set({ candidates: Array.isArray(candidates) ? candidates : [] }),
      setCurrentCandidate: (candidate) => set({ currentCandidate: candidate }),
      addCandidate: (candidate) => set((state) => ({ candidates: [...(state.candidates || []), candidate] })),
      updateCandidate: (id, updates) =>
        set((state) => ({
          candidates: (state.candidates || []).map((candidate) =>
            candidate.id === id ? { ...candidate, ...updates } : candidate
          ),
          currentCandidate:
            state.currentCandidate?.id === id ? { ...state.currentCandidate, ...updates } : state.currentCandidate,
        })),
      removeCandidate: (id) =>
        set((state) => ({
          candidates: (state.candidates || []).filter((candidate) => candidate.id !== id),
          currentCandidate: state.currentCandidate?.id === id ? null : state.currentCandidate,
        })),
      setLoading: (loading) => set({ loading }),
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
      setPagination: (pagination) => set((state) => ({ pagination: { ...state.pagination, ...pagination } })),
      resetFilters: () =>
        set({
          filters: { search: '', stage: 'all', jobId: '' },
          pagination: { page: 1, pageSize: 50, total: 0, totalPages: 0 },
        }),
    }),
    { name: 'candidates-store' }
  )
);

// Assessments store
interface AssessmentsState {
  assessments: Record<string, Assessment>; // jobId -> Assessment
  currentAssessment: Assessment | null;
  loading: LoadingState;
}

interface AssessmentsActions {
  setAssessment: (jobId: string, assessment: Assessment) => void;
  setCurrentAssessment: (assessment: Assessment | null) => void;
  updateAssessment: (jobId: string, updates: Partial<Assessment>) => void;
  removeAssessment: (jobId: string) => void;
  setLoading: (loading: LoadingState) => void;
}

export const useAssessmentsStore = create<AssessmentsState & AssessmentsActions>()(
  devtools(
    (set, get) => ({
      // State
      assessments: {},
      currentAssessment: null,
      loading: { isLoading: false },

      // Actions
      setAssessment: (jobId, assessment) =>
        set((state) => ({
          assessments: { ...state.assessments, [jobId]: assessment },
        })),
      setCurrentAssessment: (assessment) => set({ currentAssessment: assessment }),
      updateAssessment: (jobId, updates) =>
        set((state) => {
          const existingAssessment = state.assessments[jobId];
          if (!existingAssessment) return state;
          
          return {
            assessments: {
              ...state.assessments,
              [jobId]: { ...existingAssessment, ...updates },
            },
            currentAssessment:
              state.currentAssessment?.jobId === jobId
                ? { ...state.currentAssessment, ...updates }
                : state.currentAssessment,
          };
        }),
      removeAssessment: (jobId) =>
        set((state) => {
          const { [jobId]: removed, ...rest } = state.assessments;
          return {
            assessments: rest,
            currentAssessment: state.currentAssessment?.jobId === jobId ? null : state.currentAssessment,
          };
        }),
      setLoading: (loading) => set({ loading }),
    }),
    { name: 'assessments-store' }
  )
);

// UI store for global UI state
interface UIState {
  toasts: Toast[];
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  modals: {
    jobForm: { open: boolean; job?: Job };
    candidateForm: { open: boolean; candidate?: Candidate };
    deleteConfirm: { open: boolean; type?: 'job' | 'candidate'; id?: string };
  };
}

interface UIActions {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  openModal: (modal: keyof UIState['modals'], data?: any) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIState & UIActions>()(
  devtools(
    (set, get) => ({
      // State
      toasts: [],
      sidebarOpen: true,
      theme: 'light',
      modals: {
        jobForm: { open: false },
        candidateForm: { open: false },
        deleteConfirm: { open: false },
      },

      // Actions
      addToast: (toast) =>
        set((state) => ({
          toasts: [
            ...state.toasts,
            {
              ...toast,
              id: Math.random().toString(36).substr(2, 9),
              duration: toast.duration || 5000,
            },
          ],
        })),
      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
      clearToasts: () => set({ toasts: [] }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      openModal: (modal, data) =>
        set((state) => ({
          modals: {
            ...state.modals,
            [modal]: { open: true, ...data },
          },
        })),
      closeModal: (modal) =>
        set((state) => ({
          modals: {
            ...state.modals,
            [modal]: { open: false },
          },
        })),
      closeAllModals: () =>
        set({
          modals: {
            jobForm: { open: false },
            candidateForm: { open: false },
            deleteConfirm: { open: false },
          },
        }),
    }),
    { name: 'ui-store' }
  )
);

// Application store for global app state
interface AppState {
  initialized: boolean;
  version: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'hr' | 'recruiter' | 'candidate';
  } | null;
}

interface AppActions {
  setInitialized: (initialized: boolean) => void;
  setUser: (user: AppState['user']) => void;
  logout: () => void;
}

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    (set, get) => ({
      // State
      initialized: false,
      version: '1.0.0',
      user: null, // Start without a logged-in user

      // Actions
      setInitialized: (initialized) => set({ initialized }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'app-store' }
  )
);

// Combined store hook for convenience
export const useStores = () => ({
  jobs: useJobsStore(),
  candidates: useCandidatesStore(),
  assessments: useAssessmentsStore(),
  ui: useUIStore(),
  app: useAppStore(),
});

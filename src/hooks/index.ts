import { useCallback, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  jobsApi,
  candidatesApi,
  assessmentsApi,
  utilityApi,
  withRetry
} from '../api/services';
import { useJobsStore, useCandidatesStore, useAssessmentsStore, useUIStore, useAppStore } from '../store';
import { Job, Candidate, Assessment, JobFilters, CandidateFilters, PaginatedResponse } from '../types';
import { debounce, getErrorMessage } from '../utils';

// ---------------- Jobs hooks ----------------
export const useJobs = (filters: JobFilters = {}) => {
  const { setJobs, setPagination, setLoading } = useJobsStore();
  
  const query = useQuery<PaginatedResponse<Job>>({
    queryKey: ['jobs', filters],
    queryFn: () => withRetry(() => jobsApi.getJobs(filters))
  });

  useEffect(() => {
    if (!query.data) return;

    const serverJobs = Array.isArray(query.data.data) ? query.data.data : [];
    const currentJobs = useJobsStore.getState().jobs || [];
    const optimisticJobs = currentJobs.filter(job => !serverJobs.find(sj => sj.id === job.id));
    const mergedJobs = [...serverJobs, ...optimisticJobs];

    setJobs(mergedJobs);
    setPagination({
      page: query.data.page,
      pageSize: query.data.pageSize,
      total: query.data.total + optimisticJobs.length,
      totalPages: Math.ceil((query.data.total + optimisticJobs.length) / query.data.pageSize)
    });
  }, [query.data, setJobs, setPagination]);

  useEffect(() => {
    setLoading({ 
      isLoading: query.isLoading, 
      error: query.error ? (query.error.message || query.error.toString() || 'An error occurred') : undefined
    });
  }, [query.isLoading, query.error, setLoading]);

  return query;
};

export const useJob = (id: string) => {
  const { setCurrentJob } = useJobsStore();
  const query = useQuery({
    queryKey: ['job', id],
    queryFn: () => withRetry(() => jobsApi.getJob(id)),
    enabled: !!id
  });

  useEffect(() => {
    if (query.data) setCurrentJob(query.data);
  }, [query.data, setCurrentJob]);

  return query;
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  const { addJob } = useJobsStore();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) =>
      withRetry(() => jobsApi.createJob(jobData)),
    onSuccess: (newJob) => {
      addJob(newJob);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      addToast({ title: 'Success', description: 'Job created successfully', type: 'success' });
    },
    onError: (error: any) => {
      addToast({ title: 'Error', description: getErrorMessage(error, 'Failed to create job'), type: 'error' });
    }
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  const { updateJob } = useJobsStore();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Job> }) =>
      withRetry(() => jobsApi.updateJob(id, updates)),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      await queryClient.cancelQueries({ queryKey: ['job', id] });

      const previousJobs = queryClient.getQueryData(['jobs']);
      const previousJob = queryClient.getQueryData(['job', id]);

      updateJob(id, updates);
      queryClient.setQueryData(['job', id], (old: Job) => ({ ...old, ...updates }));

      return { previousJobs, previousJob };
    },
    onError: (error: any, { id }, context) => {
      if (context?.previousJobs) queryClient.setQueryData(['jobs'], context.previousJobs);
      if (context?.previousJob) queryClient.setQueryData(['job', id], context.previousJob);
      addToast({ title: 'Error', description: getErrorMessage(error, 'Failed to update job'), type: 'error' });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
    onSuccess: () => addToast({ title: 'Success', description: 'Job updated successfully', type: 'success' })
  });
};

export const useReorderJobs = () => {
  const queryClient = useQueryClient();
  const { setJobs } = useJobsStore();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: ({ fromOrder, toOrder }: { fromOrder: number; toOrder: number }) =>
      withRetry(() => jobsApi.reorderJobs(fromOrder, toOrder)),
    onMutate: async ({ fromOrder, toOrder }) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      const previousJobs = queryClient.getQueryData(['jobs']) as any;
      if (previousJobs?.data) {
        const jobs = [...previousJobs.data];
        const jobToMove = jobs.find(job => job.order === fromOrder);
        if (jobToMove) {
          const optimisticJobs = jobs.map(job => {
            if (job.order === fromOrder) return { ...job, order: toOrder };
            if (fromOrder < toOrder && job.order > fromOrder && job.order <= toOrder) return { ...job, order: job.order - 1 };
            if (fromOrder > toOrder && job.order >= toOrder && job.order < fromOrder) return { ...job, order: job.order + 1 };
            return job;
          });
          setJobs(optimisticJobs);
        }
      }
      return { previousJobs };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousJobs) setJobs(context.previousJobs.data || []);
      addToast({ title: 'Error', description: 'Failed to reorder jobs. Changes have been reverted.', type: 'error' });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
    onSuccess: (reorderedJobs) => setJobs(reorderedJobs)
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  const { removeJob } = useJobsStore();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (id: string) => withRetry(() => jobsApi.deleteJob(id)),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      await queryClient.cancelQueries({ queryKey: ['job', id] });

      const previousJobs = queryClient.getQueryData(['jobs']);
      const previousJob = queryClient.getQueryData(['job', id]);

      const currentJobs = useJobsStore.getState().jobs || [];
      const jobToArchive = currentJobs.find(job => job.id === id);
      if (jobToArchive) removeJob(id);

      return { previousJobs, previousJob };
    },
    onError: (error: any, id, context) => {
      if (context?.previousJobs) queryClient.setQueryData(['jobs'], context.previousJobs);
      if (context?.previousJob) queryClient.setQueryData(['job', id], context.previousJob);
      addToast({ title: 'Error', description: getErrorMessage(error, 'Failed to archive job'), type: 'error' });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['jobs'] }),
    onSuccess: () => addToast({ title: 'Success', description: 'Job archived successfully', type: 'success' })
  });
};

// ---------------- Candidates hooks ----------------
export const useCandidates = (filters: CandidateFilters = {}) => {
  const { setCandidates, setPagination, setLoading } = useCandidatesStore();
  
  const query = useQuery({
    queryKey: ['candidates', filters],
    queryFn: () => withRetry(() => candidatesApi.getCandidates(filters))
  });

  useEffect(() => {
    if (!query.data) return;

    const serverCandidates = Array.isArray(query.data.data) ? query.data.data : [];
    setCandidates(serverCandidates);
    setPagination({
      page: query.data.page,
      pageSize: query.data.pageSize,
      total: query.data.total,
      totalPages: query.data.totalPages
    });
  }, [query.data, setCandidates, setPagination]);

  useEffect(() => {
    setLoading({ 
      isLoading: query.isLoading, 
      error: query.error ? (query.error.message || query.error.toString() || 'An error occurred') : undefined
    });
  }, [query.isLoading, query.error, setLoading]);

  return query;
};

export const useCandidate = (id: string) => {
  const { setCurrentCandidate } = useCandidatesStore();
  const query = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => withRetry(() => candidatesApi.getCandidate(id)),
    enabled: !!id
  });

  useEffect(() => {
    if (query.data) setCurrentCandidate(query.data);
  }, [query.data, setCurrentCandidate]);

  return query;
};

export const useUpdateCandidate = () => {
  const queryClient = useQueryClient();
  const { updateCandidate } = useCandidatesStore();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Candidate> }) =>
      withRetry(() => candidatesApi.updateCandidate(id, updates)),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['candidates'] });
      await queryClient.cancelQueries({ queryKey: ['candidate', id] });

      const previousCandidates = queryClient.getQueryData(['candidates']);
      const previousCandidate = queryClient.getQueryData(['candidate', id]);

      updateCandidate(id, updates);
      queryClient.setQueryData(['candidate', id], (old: Candidate) => ({ ...old, ...updates }));

      return { previousCandidates, previousCandidate };
    },
    onError: (error: any, { id }, context) => {
      if (context?.previousCandidates) queryClient.setQueryData(['candidates'], context.previousCandidates);
      if (context?.previousCandidate) queryClient.setQueryData(['candidate', id], context.previousCandidate);
      addToast({ title: 'Error', description: getErrorMessage(error, 'Failed to update candidate'), type: 'error' });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['candidates'] }),
    onSuccess: () => addToast({ title: 'Success', description: 'Candidate updated successfully', type: 'success' })
  });
};

// ---------------- Assessment hooks ----------------
export const useAssessment = (jobId: string) => {
  const { setCurrentAssessment } = useAssessmentsStore();
  const query = useQuery({
    queryKey: ['assessment', jobId],
    queryFn: () => withRetry(() => assessmentsApi.getAssessment(jobId)),
    enabled: !!jobId
  });

  useEffect(() => {
    if (query.data) setCurrentAssessment(query.data);
  }, [query.data, setCurrentAssessment]);

  return query;
};

export const useSaveAssessment = () => {
  const queryClient = useQueryClient();
  const { setAssessment } = useAssessmentsStore();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: ({ jobId, assessment }: { jobId: string; assessment: Assessment }) =>
      withRetry(() => assessmentsApi.saveAssessment(jobId, assessment)),
    onSuccess: (savedAssessment, { jobId }) => {
      setAssessment(jobId, savedAssessment);
      queryClient.setQueryData(['assessment', jobId], savedAssessment);
      addToast({ title: 'Success', description: 'Assessment saved successfully', type: 'success' });
    },
    onError: (error: any) => {
      addToast({ title: 'Error', description: getErrorMessage(error, 'Failed to save assessment'), type: 'error' });
    }
  });
};

// ---------------- Utility hooks ----------------
export const useAppInitialization = () => {
  const { setInitialized } = useAppStore();
  const query = useQuery({
    queryKey: ['app-init'],
    queryFn: () => withRetry(() => utilityApi.initializeApp()),
    retry: 3,
    retryDelay: 1000
  });

  useEffect(() => {
    if (query.isSuccess) setInitialized(true);
  }, [query.isSuccess, setInitialized]);

  return query;
};

export const useDebouncedSearch = <T>(searchFn: (query: string) => Promise<T>, delay: number = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setResults(null);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      setError(null);
      try {
        setResults(await searchFn(query));
      } catch (err: any) {
        setError(err.message || 'Search failed');
        setResults(null);
      } finally {
        setIsSearching(false);
      }
    }, delay),
    [delay, searchFn]
  );

  useEffect(() => { debouncedSearch(searchTerm); }, [searchTerm, debouncedSearch]);

  return { searchTerm, setSearchTerm, isSearching, results, error };
};

// The remaining hooks (useVirtualList, useLocalStorage, useMediaQuery, useOnlineStatus, authentication hooks)
// can remain as in your code, they are clean and have no ESLint warnings.

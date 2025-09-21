import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { 
  jobsApi, 
  candidatesApi, 
  assessmentsApi, 
  utilityApi,
  authApi,
  withRetry,
  createDebouncedRequest 
} from '../api/services';
import { useJobsStore, useCandidatesStore, useAssessmentsStore, useUIStore, useAppStore } from '../store';
import { Job, Candidate, Assessment, AssessmentResponse, JobFilters, CandidateFilters, PaginatedResponse } from '../types';
import { debounce, getErrorMessage } from '../utils';

// Jobs hooks
export const useJobs = (filters: JobFilters = {}) => {
  const { setJobs, setPagination, setLoading } = useJobsStore();
  
  const query = useQuery<PaginatedResponse<Job>>({
    queryKey: ['jobs', filters],
    queryFn: () => {
      console.log('🔄 useJobs: Fetching jobs with filters:', filters);
      return withRetry(() => jobsApi.getJobs(filters));
    },
    staleTime: 0, // Disable caching for debugging
    gcTime: 0, // Don't cache results
  });

  useEffect(() => {
    if (query.data) {
      // Don't overwrite the store immediately after cache invalidation
      // to prevent removing optimistically added jobs
      const serverJobs = Array.isArray(query.data.data) ? query.data.data : [];
      console.log('💾 useJobs: Processing', serverJobs.length, 'jobs from server');
      
      // Get current jobs from store to preserve optimistic updates
      const currentJobs = useJobsStore.getState().jobs || [];
      
      // Check if we have optimistically added jobs that aren't in the server response
      const optimisticJobs = currentJobs.filter((job: Job) => 
        !serverJobs.find((serverJob: Job) => serverJob.id === job.id)
      );
      
      // Merge server jobs with optimistic jobs
      const mergedJobs = [...serverJobs, ...optimisticJobs];
      console.log('🔀 useJobs: Setting', mergedJobs.length, 'jobs in store');
      
      setJobs(mergedJobs);
      setPagination({
        page: query.data.page,
        pageSize: query.data.pageSize,
        total: query.data.total + optimisticJobs.length,
        totalPages: Math.ceil((query.data.total + optimisticJobs.length) / query.data.pageSize),
      });
    }
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
    enabled: !!id,
  });

  useEffect(() => {
    if (query.data) {
      setCurrentJob(query.data);
    }
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
      // Optimistically update the store first
      addJob(newJob);
      
      // Update all jobs queries in the cache by iterating through them
      queryClient.getQueryCache().findAll({ queryKey: ['jobs'] }).forEach((query) => {
        const oldData = query.state.data as any;
        if (oldData && oldData.data && Array.isArray(oldData.data)) {
          queryClient.setQueryData(query.queryKey, {
            ...oldData,
            data: [...oldData.data, newJob],
            total: oldData.total + 1,
          });
        }
      });
      
      // Immediately invalidate to ensure server sync - the merge logic will preserve optimistic updates
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      addToast({
        title: 'Success',
        description: 'Job created successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      addToast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to create job'),
        type: 'error',
      });
    },
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
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      await queryClient.cancelQueries({ queryKey: ['job', id] });

      // Snapshot the previous values
      const previousJobs = queryClient.getQueryData(['jobs']);
      const previousJob = queryClient.getQueryData(['job', id]);

      // Optimistically update
      updateJob(id, updates);
      queryClient.setQueryData(['job', id], (old: Job) => ({ ...old, ...updates }));

      return { previousJobs, previousJob };
    },
    onError: (error: any, { id }, context) => {
      // Rollback on error
      if (context?.previousJobs) {
        queryClient.setQueryData(['jobs'], context.previousJobs);
      }
      if (context?.previousJob) {
        queryClient.setQueryData(['job', id], context.previousJob);
      }

      addToast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to update job'),
        type: 'error',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: 'Job updated successfully',
        type: 'success',
      });
    },
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

      // Optimistic reorder logic
      if (previousJobs?.data) {
        const jobs = [...previousJobs.data];
        const jobToMove = jobs.find(job => job.order === fromOrder);
        
        if (jobToMove) {
          // Update order for all affected jobs
          const optimisticJobs = jobs.map(job => {
            if (job.order === fromOrder) {
              return { ...job, order: toOrder };
            } else if (fromOrder < toOrder && job.order > fromOrder && job.order <= toOrder) {
              return { ...job, order: job.order - 1 };
            } else if (fromOrder > toOrder && job.order >= toOrder && job.order < fromOrder) {
              return { ...job, order: job.order + 1 };
            }
            return job;
          });

          setJobs(optimisticJobs);
        }
      }

      return { previousJobs };
    },
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousJobs) {
        setJobs(context.previousJobs.data || []);
      }

      addToast({
        title: 'Error',
        description: 'Failed to reorder jobs. Changes have been reverted.',
        type: 'error',
      });
    },
    onSuccess: (reorderedJobs) => {
      setJobs(reorderedJobs);
      addToast({
        title: 'Success',
        description: 'Jobs reordered successfully',
        type: 'success',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  const { removeJob } = useJobsStore();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (id: string) => withRetry(() => jobsApi.deleteJob(id)),
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['jobs'] });
      await queryClient.cancelQueries({ queryKey: ['job', id] });

      // Snapshot the previous values
      const previousJobs = queryClient.getQueryData(['jobs']);
      const previousJob = queryClient.getQueryData(['job', id]);

      // Optimistically remove from store (but really archive)
      const currentJobs = useJobsStore.getState().jobs || [];
      const jobToArchive = currentJobs.find(job => job.id === id);
      if (jobToArchive) {
        removeJob(id);
      }

      return { previousJobs, previousJob };
    },
    onError: (error: any, id, context) => {
      // Rollback on error
      if (context?.previousJobs) {
        queryClient.setQueryData(['jobs'], context.previousJobs);
      }
      if (context?.previousJob) {
        queryClient.setQueryData(['job', id], context.previousJob);
      }

      addToast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to archive job'),
        type: 'error',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: 'Job archived successfully',
        type: 'success',
      });
    },
  });
};

// Candidates hooks
export const useCandidates = (filters: CandidateFilters = {}) => {
  const { setCandidates, setPagination, setLoading } = useCandidatesStore();
  
  const query = useQuery({
    queryKey: ['candidates', filters],
    queryFn: () => {
      console.log('🔄 useCandidates: Fetching candidates with filters:', filters);
      return withRetry(() => candidatesApi.getCandidates(filters));
    },
    staleTime: 0, // Disable caching for debugging
    gcTime: 0, // Don't cache results
  });

  useEffect(() => {
    if (query.data) {
      const serverCandidates = Array.isArray(query.data.data) ? query.data.data : [];
      
      setCandidates(serverCandidates);
      setPagination({
        page: query.data.page,
        pageSize: query.data.pageSize,
        total: query.data.total,
        totalPages: query.data.totalPages,
      });
    }
  }, [query.data, setCandidates, setPagination]);

  useEffect(() => {
    setLoading({ 
      isLoading: query.isLoading, 
      error: query.error ? (query.error.message || query.error.toString() || 'An error occurred') : undefined
    });
    
    if (query.error) {
      console.error('❌ useCandidates: Error fetching candidates:', query.error);
    }
  }, [query.isLoading, query.error, setLoading]);

  return query;
};

export const useCandidate = (id: string) => {
  const { setCurrentCandidate } = useCandidatesStore();
  
  const query = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => withRetry(() => candidatesApi.getCandidate(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (query.data) {
      setCurrentCandidate(query.data);
    }
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
      if (context?.previousCandidates) {
        queryClient.setQueryData(['candidates'], context.previousCandidates);
      }
      if (context?.previousCandidate) {
        queryClient.setQueryData(['candidate', id], context.previousCandidate);
      }

      addToast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to update candidate'),
        type: 'error',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
    onSuccess: () => {
      addToast({
        title: 'Success',
        description: 'Candidate updated successfully',
        type: 'success',
      });
    },
  });
};

// Assessment hooks
export const useAssessment = (jobId: string) => {
  const { setCurrentAssessment } = useAssessmentsStore();
  
  const query = useQuery({
    queryKey: ['assessment', jobId],
    queryFn: () => withRetry(() => assessmentsApi.getAssessment(jobId)),
    enabled: !!jobId,
  });

  useEffect(() => {
    if (query.data) {
      setCurrentAssessment(query.data);
    }
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
      
      addToast({
        title: 'Success',
        description: 'Assessment saved successfully',
        type: 'success',
      });
    },
    onError: (error: any) => {
      addToast({
        title: 'Error',
        description: getErrorMessage(error, 'Failed to save assessment'),
        type: 'error',
      });
    },
  });
};

// Utility hooks
export const useAppInitialization = () => {
  const { setInitialized } = useAppStore();
  
  const query = useQuery({
    queryKey: ['app-init'],
    queryFn: () => withRetry(() => utilityApi.initializeApp()),
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (query.isSuccess) {
      setInitialized(true);
    }
  }, [query.isSuccess, setInitialized]);

  return query;
};

// Search hooks with debouncing
export const useDebouncedSearch = <T>(
  searchFn: (query: string) => Promise<T>,
  delay: number = 300
) => {
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
        const searchResults = await searchFn(query);
        setResults(searchResults);
      } catch (err: any) {
        setError(err.message || 'Search failed');
        setResults(null);
      } finally {
        setIsSearching(false);
      }
    }, delay),
    [searchFn, delay]
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  return {
    searchTerm,
    setSearchTerm,
    isSearching,
    results,
    error,
  };
};

// Virtual list hook for performance
export const useVirtualList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length - 1
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    scrollTop,
    setScrollTop,
  };
};

// Local storage hook
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Media query hook
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
};

// Online status hook
export const useOnlineStatus = (): boolean => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
};

// Authentication hooks
export const useSignup = () => {
  const { setUser } = useAppStore();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (userData: {
      name: string;
      email: string;
      password: string;
      role: 'hr' | 'candidate';
    }) => withRetry(() => authApi.signup(userData)),
    onSuccess: (user) => {
      setUser(user);
      addToast({
        title: 'Account Created',
        description: 'Welcome to TalentFlow! Your account has been created successfully.',
        type: 'success',
      });
    },
    onError: (error: any) => {
      addToast({
        title: 'Signup Failed',
        description: getErrorMessage(error, 'Failed to create account'),
        type: 'error',
      });
    },
  });
};

export const useSignin = () => {
  const { setUser } = useAppStore();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (credentials: {
      email: string;
      password: string;
    }) => withRetry(() => authApi.signin(credentials)),
    onSuccess: (user) => {
      setUser(user);
      addToast({
        title: 'Welcome Back',
        description: `Successfully signed in as ${user.name}`,
        type: 'success',
      });
    },
    onError: (error: any) => {
      addToast({
        title: 'Signin Failed',
        description: getErrorMessage(error, 'Invalid email or password'),
        type: 'error',
      });
    },
  });
};

export const useLogout = () => {
  const { logout } = useAppStore();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: () => withRetry(() => authApi.logout()),
    onSuccess: () => {
      logout();
      addToast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
        type: 'success',
      });
    },
    onError: (error: any) => {
      // Even if the API call fails, we should still log out locally
      logout();
      addToast({
        title: 'Logged Out',
        description: 'You have been logged out.',
        type: 'success',
      });
    },
  });
};

export const useVerifySession = () => {
  const { setUser, logout } = useAppStore();

  const query = useQuery({
    queryKey: ['auth', 'verify'],
    queryFn: () => withRetry(() => authApi.verifySession()),
    retry: false,
  });

  useEffect(() => {
    if (query.isSuccess && query.data) {
      setUser(query.data);
    } else if (query.isError) {
      // Session is invalid, log out
      logout();
    }
  }, [query.isSuccess, query.isError, query.data, setUser, logout]);

  return query;
};

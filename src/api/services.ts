import { Job, Candidate, Assessment, AssessmentResponse, PaginatedResponse, ApiResponse, MirageResponse, JobFilters, CandidateFilters } from '../types';

const API_BASE = '/api';

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// Jobs API
export const jobsApi = {
  // Get all jobs with filters and pagination
  getJobs: async (filters: JobFilters = {}): Promise<PaginatedResponse<Job>> => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.pageSize) params.set('pageSize', filters.pageSize.toString());
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.sortDirection) params.set('sortDirection', filters.sortDirection);

    const response = await apiCall<MirageResponse<Job>>(`/jobs?${params.toString()}`);
    console.log('🔍 jobsApi.getJobs: Raw response from apiCall:', response);
    
    // MirageJS returns: { success: true, data: [...], total: 37, page: 1, pageSize: 100, totalPages: ... }
    // This is returned directly by apiCall as a MirageResponse
    console.log('🔍 jobsApi.getJobs: response.data:', response.data);
    console.log('🔍 jobsApi.getJobs: Retrieved', response.data?.length, 'jobs');

    const data = response.data;
    
    const result: PaginatedResponse<Job> = {
      data: data,
      total: response.total,
      page: response.page,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
    };
    
    console.log('🔍 jobsApi.getJobs: Final result:', result);
    return result;
  },

  // Get single job by ID
  getJob: async (id: string): Promise<Job> => {
    const response = await apiCall<ApiResponse<Job>>(`/jobs/${id}`);
    return response.data;
  },

  // Create new job
  createJob: async (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> => {
    const response = await apiCall<ApiResponse<Job>>('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
    return response.data;
  },

  // Update existing job
  updateJob: async (id: string, updates: Partial<Job>): Promise<Job> => {
    const response = await apiCall<ApiResponse<Job>>(`/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return response.data;
  },

  // Reorder jobs
  reorderJobs: async (fromOrder: number, toOrder: number): Promise<Job[]> => {
    const response = await apiCall<ApiResponse<Job[]>>(`/jobs/reorder`, {
      method: 'PATCH',
      body: JSON.stringify({ fromOrder, toOrder }),
    });
    return response.data;
  },

  // Delete job (archive)
  deleteJob: async (id: string): Promise<void> => {
    await apiCall(`/jobs/${id}`, { method: 'DELETE' });
  },
};

// Candidates API
export const candidatesApi = {
  // Get all candidates with filters and pagination
  getCandidates: async (filters: CandidateFilters = {}): Promise<PaginatedResponse<Candidate>> => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.stage) params.set('stage', filters.stage);
    if (filters.jobId) params.set('jobId', filters.jobId);
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.pageSize) params.set('pageSize', filters.pageSize.toString());

    const response = await apiCall<MirageResponse<Candidate>>(`/candidates?${params.toString()}`);
    console.log('🔍 candidatesApi.getCandidates: Raw response from apiCall:', response);
    
    // MirageJS returns: { success: true, data: [...], total: 1000, page: 1, pageSize: 100, totalPages: ... }
    // This is returned directly by apiCall as a MirageResponse
    
    const result: PaginatedResponse<Candidate> = {
      data: response.data,
      total: response.total,
      page: response.page,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
    };
    
    return result;
  },

  // Get single candidate by ID
  getCandidate: async (id: string): Promise<Candidate> => {
    const response = await apiCall<ApiResponse<Candidate>>(`/candidates/${id}`);
    return response.data;
  },

  // Get candidate timeline
  getCandidateTimeline: async (id: string): Promise<any[]> => {
    const response = await apiCall<ApiResponse<any[]>>(`/candidates/${id}/timeline`);
    return response.data;
  },

  // Create new candidate
  createCandidate: async (candidateData: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'notes' | 'timeline'>): Promise<Candidate> => {
    const response = await apiCall<ApiResponse<Candidate>>('/candidates', {
      method: 'POST',
      body: JSON.stringify(candidateData),
    });
    return response.data;
  },

  // Update existing candidate
  updateCandidate: async (id: string, updates: Partial<Candidate>): Promise<Candidate> => {
    const response = await apiCall<ApiResponse<Candidate>>(`/candidates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return response.data;
  },

  // Delete candidate
  deleteCandidate: async (id: string): Promise<void> => {
    await apiCall(`/candidates/${id}`, { method: 'DELETE' });
  },
};

// Assessments API
export const assessmentsApi = {
  // Get assessment for a job
  getAssessment: async (jobId: string): Promise<Assessment> => {
    const response = await apiCall<ApiResponse<Assessment>>(`/assessments/${jobId}`);
    return response.data;
  },

  // Save/update assessment for a job
  saveAssessment: async (jobId: string, assessment: Assessment): Promise<Assessment> => {
    const response = await apiCall<ApiResponse<Assessment>>(`/assessments/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(assessment),
    });
    return response.data;
  },

  // Submit assessment response
  submitAssessmentResponse: async (jobId: string, response: Omit<AssessmentResponse, 'id' | 'createdAt' | 'updatedAt'>): Promise<AssessmentResponse> => {
    const apiResponse = await apiCall<ApiResponse<AssessmentResponse>>(`/assessments/${jobId}/submit`, {
      method: 'POST',
      body: JSON.stringify(response),
    });
    return apiResponse.data;
  },

  // Get assessment responses
  getAssessmentResponses: async (assessmentId: string): Promise<AssessmentResponse[]> => {
    const response = await apiCall<ApiResponse<AssessmentResponse[]>>(`/assessments/${assessmentId}/responses`);
    return response.data;
  },
};

// Authentication API
export const authApi = {
  // User signup/registration
  signup: async (userData: {
    name: string;
    email: string;
    password: string;
    role: 'hr' | 'candidate';
  }): Promise<{
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'hr' | 'recruiter' | 'candidate';
  }> => {
    const response = await apiCall<ApiResponse<any>>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.data;
  },

  // User signin/login
  signin: async (credentials: {
    email: string;
    password: string;
  }): Promise<{
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'hr' | 'recruiter' | 'candidate';
  }> => {
    const response = await apiCall<ApiResponse<any>>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.data;
  },

  // User logout
  logout: async (): Promise<void> => {
    await apiCall('/auth/logout', {
      method: 'POST',
    });
  },

  // Verify/refresh user session
  verifySession: async (): Promise<{
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'hr' | 'recruiter' | 'candidate';
  }> => {
    const response = await apiCall<ApiResponse<any>>('/auth/verify');
    return response.data;
  },

  // Password reset request
  requestPasswordReset: async (email: string): Promise<void> => {
    await apiCall('/auth/reset-password-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Password reset confirmation
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password: newPassword }),
    });
  },
};

// Utility API
export const utilityApi = {
  // Initialize application data
  initializeApp: async (): Promise<any> => {
    const response = await apiCall<any>('/init');
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await apiCall<ApiResponse<{ status: string; timestamp: string }>>('/health');
    return response.data;
  },
};

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return new ApiError(
      error.response.data?.message || 'An error occurred',
      error.response.status,
      error.response.data
    );
  } else if (error.request) {
    // The request was made but no response was received
    return new ApiError('Network error - no response received');
  } else {
    // Something happened in setting up the request that triggered an Error
    return new ApiError(error.message || 'An unexpected error occurred');
  }
};

// Retry logic for failed requests
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (i === maxRetries) {
        throw handleApiError(error);
      }

      // Only retry on network errors or 5xx status codes
      if (error instanceof ApiError && error.status && error.status < 500) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw handleApiError(lastError);
};

// Optimistic update utilities
export interface OptimisticUpdate<T> {
  optimisticData: T;
  rollback: () => void;
  commit: () => Promise<T>;
}

export const createOptimisticUpdate = <T>(
  currentData: T,
  optimisticData: T,
  commitFn: () => Promise<T>
): OptimisticUpdate<T> => {
  return {
    optimisticData,
    rollback: () => currentData,
    commit: commitFn,
  };
};

// Request debouncing for search
export const createDebouncedRequest = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  delay: number = 300
) => {
  let timeoutId: NodeJS.Timeout;
  let latestArgs: T;

  return (...args: T): Promise<R> => {
    latestArgs = args;

    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...latestArgs);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
};

// Cache invalidation utilities
export const getCacheKey = (endpoint: string, params?: Record<string, any>): string => {
  if (!params) return endpoint;
  
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {} as Record<string, any>);

  return `${endpoint}?${new URLSearchParams(sortedParams).toString()}`;
};

export const invalidateRelatedQueries = (queryClient: any, entityType: 'jobs' | 'candidates' | 'assessments') => {
  // This would be used with React Query to invalidate related caches
  const relatedKeys = {
    jobs: ['jobs', 'candidates'],
    candidates: ['candidates', 'jobs'],
    assessments: ['assessments', 'jobs'],
  };

  relatedKeys[entityType].forEach(key => {
    queryClient.invalidateQueries({ queryKey: [key] });
  });
};

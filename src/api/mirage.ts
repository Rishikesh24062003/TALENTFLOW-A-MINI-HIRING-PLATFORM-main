import { createServer, Response } from 'miragejs';
import { StorageService } from '../lib/storage';
import { Job, Candidate, Assessment, AssessmentResponse, PaginatedResponse } from '../types';
import { seedDataToStorage } from '../lib/seedData';

// Utility to add artificial latency
const addLatency = () => {
  const latency = Math.random() * 1000 + 200; // 200-1200ms
  return new Promise(resolve => setTimeout(resolve, latency));
};

// Utility to simulate random errors (for testing error handling)
const maybeError = () => {
  // Reduced error rate for better development experience
  // Set to 0 to disable errors completely, or 0.01 for 1% error rate
  const errorRate = 0; // 0.5% in dev, 7.5% in prod
  if (Math.random() < errorRate) {
    throw new Response(500, {}, { 
      success: false, 
      message: 'Internal server error. Please try again.' 
    });
  }
};

// Pagination utility
const paginate = <T>(
  items: T[], 
  page: number = 1, 
  pageSize: number = 10
): PaginatedResponse<T> => {
  const offset = (page - 1) * pageSize;
  const paginatedItems = items.slice(offset, offset + pageSize);
  
  return {
    data: paginatedItems,
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
  };
};

export const makeServer = () => {
  return createServer({
    routes() {
      this.namespace = 'api';
      this.timing = 0; // We handle timing manually

      // Initialize data on server start
      this.get('/init', async () => {
        await addLatency();
        try {
          const storageInfo = await seedDataToStorage();
          return { success: true, data: storageInfo };
        } catch (error) {
          console.error('Error initializing data:', error);
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to initialize data' 
          });
        }
      });

      // Authentication endpoints
      this.post('/auth/signup', async (schema, request) => {
        await addLatency();
        
        try {
          const userData = JSON.parse(request.requestBody);
          const { name, email, password, role } = userData;
          
          // Validate required fields
          if (!name || !email || !password || !role) {
            return new Response(400, {}, { 
              success: false, 
              message: 'All fields are required' 
            });
          }
          
          // Check if user already exists
          const existingUsers = await StorageService.getUsers();
          const existingUser = existingUsers.find((user: any) => user.email === email);
          
          if (existingUser) {
            return new Response(400, {}, { 
              success: false, 
              message: 'User with this email already exists' 
            });
          }
          
          // Create new user
          const newUser = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            email,
            password, // In real app, this would be hashed
            role: role === 'hr' ? 'hr' : 'candidate',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          // Save user
          await StorageService.saveUser(newUser);
          
          // Return user without password
          const { password: _, ...userResponse } = newUser;
          return { success: true, data: userResponse };
        } catch (error) {
          console.error('Signup error:', error);
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to create account' 
          });
        }
      });

      this.post('/auth/signin', async (schema, request) => {
        await addLatency();
        
        try {
          const credentials = JSON.parse(request.requestBody);
          const { email, password } = credentials;
          
          // Validate required fields
          if (!email || !password) {
            return new Response(400, {}, { 
              success: false, 
              message: 'Email and password are required' 
            });
          }
          
          // For demo purposes, we'll simulate user authentication
          // In a real app, this would check against a database
          const demoUsers = [
            {
              id: 'hr-demo-1',
              name: 'HR Manager',
              email: 'hr@talentflow.com',
              password: 'password123',
              role: 'hr'
            },
            {
              id: 'candidate-demo-1',
              name: 'Jane Candidate',
              email: 'candidate@example.com',
              password: 'password123',
              role: 'candidate'
            }
          ];
          
          // Check against stored users first, then demo users
          const existingUsers = await StorageService.getUsers();
          let user = existingUsers.find((u: any) => u.email === email && u.password === password);
          
          if (!user) {
            user = demoUsers.find(u => u.email === email && u.password === password);
          }
          
          if (!user) {
            return new Response(401, {}, { 
              success: false, 
              message: 'Invalid email or password' 
            });
          }
          
          // Return user without password
          const { password: _, ...userResponse } = user;
          return { success: true, data: userResponse };
        } catch (error) {
          console.error('Signin error:', error);
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to sign in' 
          });
        }
      });

      this.post('/auth/logout', async () => {
        await addLatency();
        return { success: true, data: { message: 'Logged out successfully' } };
      });

      this.get('/auth/verify', async () => {
        await addLatency();
        // For demo purposes, we'll just return success
        // In a real app, this would verify JWT tokens or session cookies
        return new Response(401, {}, { 
          success: false, 
          message: 'Session expired' 
        });
      });

      this.post('/auth/reset-password-request', async (schema, request) => {
        await addLatency();
        
        try {
          const { email } = JSON.parse(request.requestBody);
          
          if (!email) {
            return new Response(400, {}, { 
              success: false, 
              message: 'Email is required' 
            });
          }
          
          // In a real app, this would send an email
          return { success: true, data: { message: 'Password reset email sent' } };
        } catch (error) {
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to send reset email' 
          });
        }
      });

      this.post('/auth/reset-password', async (schema, request) => {
        await addLatency();
        
        try {
          const { token, password } = JSON.parse(request.requestBody);
          
          if (!token || !password) {
            return new Response(400, {}, { 
              success: false, 
              message: 'Token and password are required' 
            });
          }
          
          // In a real app, this would verify the token and update the password
          return { success: true, data: { message: 'Password reset successfully' } };
        } catch (error) {
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to reset password' 
          });
        }
      });

      // Jobs endpoints
      this.get('/jobs', async (schema, request) => {
        await addLatency();
        
        try {
          const { queryParams } = request;
          const {
            search = '',
            status = 'all',
            page = '1',
            pageSize = '10',
            sort = 'order',
            sortDirection = 'asc'
          } = queryParams;

          let jobs = await StorageService.getAllJobs();
          console.log('📊 MirageJS: Retrieved', jobs.length, 'jobs from IndexedDB');
          
          // Ensure jobs is a valid array
          if (!Array.isArray(jobs)) {
            console.error('📊 MirageJS: Jobs is not an array:', jobs);
            jobs = [];
          }

          // Apply filters with safety checks
          if (search && typeof search === 'string') {
            const searchLower = search.toLowerCase();
            jobs = jobs.filter(job => {
              try {
                return job.title?.toLowerCase().includes(searchLower) ||
                       job.description?.toLowerCase().includes(searchLower) ||
                       (job.tags && Array.isArray(job.tags) && job.tags.some(tag => tag.toLowerCase().includes(searchLower)));
              } catch (e) {
                console.warn('📊 MirageJS: Error filtering job:', job, e);
                return false;
              }
            });
          }

          if (status !== 'all') {
            jobs = jobs.filter(job => job.status === status);
          }

          // Apply sorting with safety checks
          jobs.sort((a, b) => {
            let aVal: any = a[sort as keyof Job];
            let bVal: any = b[sort as keyof Job];

            // Handle missing properties
            if (aVal === undefined || aVal === null) aVal = sort === 'order' ? 999999 : '';
            if (bVal === undefined || bVal === null) bVal = sort === 'order' ? 999999 : '';

            if (sort === 'createdAt' || sort === 'updatedAt') {
              aVal = new Date(aVal).getTime();
              bVal = new Date(bVal).getTime();
              // Handle invalid dates
              if (isNaN(aVal)) aVal = 0;
              if (isNaN(bVal)) bVal = 0;
            }

            if (sortDirection === 'desc') {
              return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          });

          const pageNum = parseInt(Array.isArray(page) ? page[0] : page || '1');
          const pageSizeNum = parseInt(Array.isArray(pageSize) ? pageSize[0] : pageSize || '10');
          const result = paginate(jobs, pageNum, pageSizeNum);
          console.log('🏭 MirageJS: Jobs pagination result:', result);
          const finalResponse = { success: true, ...result };
          console.log('🏭 MirageJS: Jobs final response:', finalResponse);
          return finalResponse;
        } catch (error) {
          console.error('Error fetching jobs:', error);
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to fetch jobs' 
          });
        }
      });

      this.get('/jobs/:id', async (schema, request) => {
        await addLatency();
        
        try {
          const job = await StorageService.getJob(request.params.id);
          if (!job) {
            return new Response(404, {}, { 
              success: false, 
              message: 'Job not found' 
            });
          }
          return { success: true, data: job };
        } catch (error) {
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to fetch job' 
          });
        }
      });

      this.post('/jobs', async (schema, request) => {
        await addLatency();
        maybeError(); // Simulate random errors
        
        try {
          const jobData = JSON.parse(request.requestBody);
          const now = new Date().toISOString();
          
          // Check for unique slug
          const existingJob = await StorageService.getJobBySlug(jobData.slug);
          if (existingJob) {
            return new Response(400, {}, { 
              success: false, 
              message: 'Slug already exists' 
            });
          }

          const job: Job = {
            ...jobData,
            id: jobData.id || Math.random().toString(36).substr(2, 9),
            createdAt: now,
            updatedAt: now,
          };

          await StorageService.saveJob(job);
          return { success: true, data: job };
        } catch (error) {
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to create job' 
          });
        }
      });

      this.patch('/jobs/:id', async (schema, request) => {
        await addLatency();
        maybeError();
        
        try {
          const existingJob = await StorageService.getJob(request.params.id);
          if (!existingJob) {
            return new Response(404, {}, { 
              success: false, 
              message: 'Job not found' 
            });
          }

          const updateData = JSON.parse(request.requestBody);
          const updatedJob: Job = {
            ...existingJob,
            ...updateData,
            updatedAt: new Date().toISOString(),
          };

          await StorageService.saveJob(updatedJob);
          return { success: true, data: updatedJob };
        } catch (error) {
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to update job' 
          });
        }
      });

      this.patch('/jobs/:id/reorder', async (schema, request) => {
        await addLatency();
        maybeError(); // Higher chance of error for reorder to test rollback
        
        try {
          const { fromOrder, toOrder } = JSON.parse(request.requestBody);
          const jobs = await StorageService.getAllJobs();
          
          // Reorder logic
          const jobToMove = jobs.find(job => job.order === fromOrder);
          if (!jobToMove) {
            return new Response(400, {}, { 
              success: false, 
              message: 'Job not found' 
            });
          }

          // Update order for all affected jobs
          const updatedJobs = jobs.map(job => {
            if (job.order === fromOrder) {
              return { ...job, order: toOrder, updatedAt: new Date().toISOString() };
            } else if (fromOrder < toOrder && job.order > fromOrder && job.order <= toOrder) {
              return { ...job, order: job.order - 1, updatedAt: new Date().toISOString() };
            } else if (fromOrder > toOrder && job.order >= toOrder && job.order < fromOrder) {
              return { ...job, order: job.order + 1, updatedAt: new Date().toISOString() };
            }
            return job;
          });

          // Save all updated jobs
          await Promise.all(updatedJobs.map(job => StorageService.saveJob(job)));
          
          return { success: true, data: updatedJobs };
        } catch (error) {
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to reorder jobs' 
          });
        }
      });

      // Candidates endpoints
      this.get('/candidates', async (schema, request) => {
        await addLatency();
        
        try {
          const { queryParams } = request;
          const {
            search = '',
            stage = 'all',
            jobId = '',
            page = '1',
            pageSize = '50'
          } = queryParams;

          let candidates = await StorageService.getAllCandidates();
          console.log('📊 MirageJS: Retrieved', candidates.length, 'candidates from IndexedDB');
          console.log('📊 MirageJS: Query params:', queryParams);

          // Apply filters
          if (search && typeof search === 'string') {
            const searchLower = search.toLowerCase();
            candidates = candidates.filter(candidate => 
              candidate.name.toLowerCase().includes(searchLower) ||
              candidate.email.toLowerCase().includes(searchLower)
            );
          }

          if (stage !== 'all') {
            candidates = candidates.filter(candidate => candidate.stage === stage);
          }

          if (jobId) {
            candidates = candidates.filter(candidate => candidate.jobId === jobId);
          }

          const pageNum = parseInt(Array.isArray(page) ? page[0] : page || '1');
          const pageSizeNum = parseInt(Array.isArray(pageSize) ? pageSize[0] : pageSize || '50');
          const result = paginate(candidates, pageNum, pageSizeNum);
          console.log('🏭 MirageJS: Candidates pagination result:', result);
          const finalResponse = { success: true, ...result };
          console.log('🏭 MirageJS: Candidates final response:', finalResponse);
          return finalResponse;
        } catch (error) {
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to fetch candidates' 
          });
        }
      });

      this.get('/candidates/:id', async (schema, request) => {
        await addLatency();
        
        try {
          const candidate = await StorageService.getCandidate(request.params.id);
          if (!candidate) {
            return new Response(404, {}, { 
              success: false, 
              message: 'Candidate not found' 
            });
          }
          return { success: true, data: candidate };
        } catch (error) {
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to fetch candidate' 
          });
        }
      });

      this.get('/candidates/:id/timeline', async (schema, request) => {
        await addLatency();
        
        try {
          const candidate = await StorageService.getCandidate(request.params.id);
          if (!candidate) {
            return new Response(404, {}, { 
              success: false, 
              message: 'Candidate not found' 
            });
          }
          return { success: true, data: candidate.timeline };
        } catch (error) {
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to fetch timeline' 
          });
        }
      });

      this.post('/candidates', async (schema, request) => {
        await addLatency();
        maybeError();
        
        try {
          const candidateData = JSON.parse(request.requestBody);
          const now = new Date().toISOString();
          
          const candidate: Candidate = {
            ...candidateData,
            id: candidateData.id || Math.random().toString(36).substr(2, 9),
            notes: [],
            timeline: [{
              id: Math.random().toString(36).substr(2, 9),
              type: 'stage_change',
              description: 'Applied to position',
              newStage: candidateData.stage,
              createdAt: now,
              updatedAt: now,
            }],
            createdAt: now,
            updatedAt: now,
          };

          await StorageService.saveCandidate(candidate);
          return { success: true, data: candidate };
        } catch (error) {
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to create candidate' 
          });
        }
      });

      this.patch('/candidates/:id', async (schema, request) => {
        await addLatency();
        maybeError();
        
        try {
          const existingCandidate = await StorageService.getCandidate(request.params.id);
          if (!existingCandidate) {
            return new Response(404, {}, { 
              success: false, 
              message: 'Candidate not found' 
            });
          }

          const updateData = JSON.parse(request.requestBody);
          const now = new Date().toISOString();

          let timeline = existingCandidate.timeline;

          // If stage is changing, add timeline event
          if (updateData.stage && updateData.stage !== existingCandidate.stage) {
            timeline = [...timeline, {
              id: Math.random().toString(36).substr(2, 9),
              type: 'stage_change' as const,
              description: `Moved to ${updateData.stage} stage`,
              previousStage: existingCandidate.stage,
              newStage: updateData.stage,
              createdAt: now,
              updatedAt: now,
            }];
          }

          const updatedCandidate: Candidate = {
            ...existingCandidate,
            ...updateData,
            timeline,
            updatedAt: now,
          };

          await StorageService.saveCandidate(updatedCandidate);
          return { success: true, data: updatedCandidate };
        } catch (error) {
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to update candidate' 
          });
        }
      });

      // Assessments endpoints
      this.get('/assessments/:jobId', async (schema, request) => {
        await addLatency();
        
        try {
          const assessment = await StorageService.getAssessmentByJob(request.params.jobId);
          if (!assessment) {
            return new Response(404, {}, { 
              success: false, 
              message: 'Assessment not found' 
            });
          }
          return { success: true, data: assessment };
        } catch (error) {
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to fetch assessment' 
          });
        }
      });

      this.put('/assessments/:jobId', async (schema, request) => {
        await addLatency();
        maybeError();
        
        try {
          const assessmentData = JSON.parse(request.requestBody);
          const now = new Date().toISOString();
          
          const assessment: Assessment = {
            ...assessmentData,
            jobId: request.params.jobId,
            updatedAt: now,
          };

          await StorageService.saveAssessment(assessment);
          return { success: true, data: assessment };
        } catch (error) {
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to save assessment' 
          });
        }
      });

      this.post('/assessments/:jobId/submit', async (schema, request) => {
        await addLatency();
        maybeError();
        
        try {
          const responseData = JSON.parse(request.requestBody);
          const now = new Date().toISOString();
          
          const response: AssessmentResponse = {
            ...responseData,
            id: responseData.id || Math.random().toString(36).substr(2, 9),
            jobId: request.params.jobId,
            completedAt: now,
            createdAt: now,
            updatedAt: now,
          };

          await StorageService.saveResponse(response);
          return { success: true, data: response };
        } catch (error) {
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to submit assessment' 
          });
        }
      });

      // Additional DELETE endpoints
      this.delete('/jobs/:id', async (schema, request) => {
        await addLatency();
        maybeError();
        
        try {
          const existingJob = await StorageService.getJob(request.params.id);
          if (!existingJob) {
            return new Response(404, {}, { 
              success: false, 
              message: 'Job not found' 
            });
          }

          // Archive instead of delete
          const archivedJob = {
            ...existingJob,
            status: 'archived' as const,
            updatedAt: new Date().toISOString(),
          };

          await StorageService.saveJob(archivedJob);
          return { success: true, data: archivedJob };
        } catch (error) {
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to archive job' 
          });
        }
      });

      this.delete('/candidates/:id', async (schema, request) => {
        await addLatency();
        maybeError();
        
        try {
          await StorageService.deleteCandidate(request.params.id);
          return { success: true };
        } catch (error) {
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to delete candidate' 
          });
        }
      });

      this.delete('/assessments/:id', async (schema, request) => {
        await addLatency();
        maybeError();
        
        try {
          await StorageService.deleteAssessment(request.params.id);
          return { success: true };
        } catch (error) {
          return new Response(500, {}, { 
            success: false, 
            message: 'Failed to delete assessment' 
          });
        }
      });

      // Catch all for unhandled routes
      this.passthrough();
    },
  });
};

import localforage from 'localforage';
import { Job, Candidate, Assessment, AssessmentResponse } from '../types';

// Configure localforage instances for different data types
const jobsStore = localforage.createInstance({
  name: 'talentflow',
  storeName: 'jobs',
});

const candidatesStore = localforage.createInstance({
  name: 'talentflow',
  storeName: 'candidates',
});

const assessmentsStore = localforage.createInstance({
  name: 'talentflow',
  storeName: 'assessments',
});

const responsesStore = localforage.createInstance({
  name: 'talentflow',
  storeName: 'responses',
});

const metadataStore = localforage.createInstance({
  name: 'talentflow',
  storeName: 'metadata',
});

const usersStore = localforage.createInstance({
  name: 'talentflow',
  storeName: 'users',
});

export class StorageService {
  // Jobs storage
  static async getAllJobs(): Promise<Job[]> {
    const jobs: Job[] = [];
    await jobsStore.iterate<Job, void>((value, key) => {
      // Validate job data
      if (value && typeof value === 'object' && value.id) {
        // Ensure job has required properties with defaults
        const validJob = {
          ...value,
          order: value.order ?? 999999,
          tags: Array.isArray(value.tags) ? value.tags : [],
          status: value.status || 'active',
          title: value.title || 'Untitled Job',
          description: value.description || '',
          location: value.location || '',
          type: value.type || 'full-time',
          slug: value.slug || value.id,
          createdAt: value.createdAt || new Date().toISOString(),
          updatedAt: value.updatedAt || new Date().toISOString(),
        };
        jobs.push(validJob);
      } else {
        console.warn('🗄️ StorageService: Invalid job data for key', key, ':', value);
      }
    });
    console.log('🗄️ StorageService: Returning', jobs.length, 'validated jobs');
    return jobs.sort((a, b) => (a.order || 999999) - (b.order || 999999));
  }

  static async getJob(id: string): Promise<Job | null> {
    return await jobsStore.getItem<Job>(id);
  }

  static async saveJob(job: Job): Promise<void> {
    await jobsStore.setItem(job.id, job);
  }

  static async deleteJob(id: string): Promise<void> {
    await jobsStore.removeItem(id);
  }

  static async getJobBySlug(slug: string): Promise<Job | null> {
    const jobs = await this.getAllJobs();
    return jobs.find(job => job.slug === slug) || null;
  }

  // Candidates storage
  static async getAllCandidates(): Promise<Candidate[]> {
    const candidates: Candidate[] = [];
    await candidatesStore.iterate<Candidate, void>((value) => {
      candidates.push(value);
    });
    return candidates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getCandidate(id: string): Promise<Candidate | null> {
    return await candidatesStore.getItem<Candidate>(id);
  }

  static async saveCandidate(candidate: Candidate): Promise<void> {
    await candidatesStore.setItem(candidate.id, candidate);
  }

  static async deleteCandidate(id: string): Promise<void> {
    await candidatesStore.removeItem(id);
  }

  static async getCandidatesByJob(jobId: string): Promise<Candidate[]> {
    const candidates = await this.getAllCandidates();
    return candidates.filter(candidate => candidate.jobId === jobId);
  }

  static async getCandidatesByStage(stage: string): Promise<Candidate[]> {
    const candidates = await this.getAllCandidates();
    return candidates.filter(candidate => candidate.stage === stage);
  }

  // Assessments storage
  static async getAllAssessments(): Promise<Assessment[]> {
    const assessments: Assessment[] = [];
    await assessmentsStore.iterate<Assessment, void>((value) => {
      assessments.push(value);
    });
    return assessments;
  }

  static async getAssessment(id: string): Promise<Assessment | null> {
    return await assessmentsStore.getItem<Assessment>(id);
  }

  static async getAssessmentByJob(jobId: string): Promise<Assessment | null> {
    const assessments = await this.getAllAssessments();
    return assessments.find(assessment => assessment.jobId === jobId) || null;
  }

  static async saveAssessment(assessment: Assessment): Promise<void> {
    await assessmentsStore.setItem(assessment.id, assessment);
  }

  static async deleteAssessment(id: string): Promise<void> {
    await assessmentsStore.removeItem(id);
  }

  // Assessment responses storage
  static async getAllResponses(): Promise<AssessmentResponse[]> {
    const responses: AssessmentResponse[] = [];
    await responsesStore.iterate<AssessmentResponse, void>((value) => {
      responses.push(value);
    });
    return responses;
  }

  static async getResponse(id: string): Promise<AssessmentResponse | null> {
    return await responsesStore.getItem<AssessmentResponse>(id);
  }

  static async getResponsesByCandidate(candidateId: string): Promise<AssessmentResponse[]> {
    const responses = await this.getAllResponses();
    return responses.filter(response => response.candidateId === candidateId);
  }

  static async getResponsesByAssessment(assessmentId: string): Promise<AssessmentResponse[]> {
    const responses = await this.getAllResponses();
    return responses.filter(response => response.assessmentId === assessmentId);
  }

  static async saveResponse(response: AssessmentResponse): Promise<void> {
    await responsesStore.setItem(response.id, response);
  }

  static async deleteResponse(id: string): Promise<void> {
    await responsesStore.removeItem(id);
  }

  // Metadata storage (for app settings, user preferences, etc.)
  static async getMetadata(key: string): Promise<any> {
    return await metadataStore.getItem(key);
  }

  static async saveMetadata(key: string, value: any): Promise<void> {
    await metadataStore.setItem(key, value);
  }

  static async deleteMetadata(key: string): Promise<void> {
    await metadataStore.removeItem(key);
  }

  // Utility methods
  static async clearAllData(): Promise<void> {
    await Promise.all([
      jobsStore.clear(),
      candidatesStore.clear(),
      assessmentsStore.clear(),
      responsesStore.clear(),
      metadataStore.clear(),
    ]);
  }

  static async getStorageInfo(): Promise<{
    jobsCount: number;
    candidatesCount: number;
    assessmentsCount: number;
    responsesCount: number;
  }> {
    const [jobs, candidates, assessments, responses] = await Promise.all([
      this.getAllJobs(),
      this.getAllCandidates(),
      this.getAllAssessments(),
      this.getAllResponses(),
    ]);

    return {
      jobsCount: jobs.length,
      candidatesCount: candidates.length,
      assessmentsCount: assessments.length,
      responsesCount: responses.length,
    };
  }

  // Backup and restore functionality
  static async exportData(): Promise<string> {
    const [jobs, candidates, assessments, responses] = await Promise.all([
      this.getAllJobs(),
      this.getAllCandidates(),
      this.getAllAssessments(),
      this.getAllResponses(),
    ]);

    const data = {
      jobs,
      candidates,
      assessments,
      responses,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(data, null, 2);
  }

  static async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      // Clear existing data
      await this.clearAllData();

      // Import new data
      if (data.jobs) {
        for (const job of data.jobs) {
          await this.saveJob(job);
        }
      }

      if (data.candidates) {
        for (const candidate of data.candidates) {
          await this.saveCandidate(candidate);
        }
      }

      if (data.assessments) {
        for (const assessment of data.assessments) {
          await this.saveAssessment(assessment);
        }
      }

      if (data.responses) {
        for (const response of data.responses) {
          await this.saveResponse(response);
        }
      }

      if (data.users) {
        for (const user of data.users) {
          await this.saveUser(user);
        }
      }
    } catch (error) {
      throw new Error('Invalid data format');
    }
  }

  // User management methods
  static async saveUser(user: any): Promise<void> {
    await usersStore.setItem(user.id, user);
  }

  static async getUser(id: string): Promise<any | null> {
    return (await usersStore.getItem(id)) || null;
  }

  static async getUserByEmail(email: string): Promise<any | null> {
    const users = await this.getUsers();
    return users.find(user => user.email === email) || null;
  }

  static async getUsers(): Promise<any[]> {
    const users: any[] = [];
    await usersStore.iterate((value) => {
      if (value && typeof value === 'object') {
        users.push(value);
      }
    });
    return users;
  }

  static async updateUser(id: string, updates: Partial<any>): Promise<void> {
    const existingUser = await this.getUser(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...existingUser,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.saveUser(updatedUser);
  }

  static async deleteUser(id: string): Promise<void> {
    await usersStore.removeItem(id);
  }
}

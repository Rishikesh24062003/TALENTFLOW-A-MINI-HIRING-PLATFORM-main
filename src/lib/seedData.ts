import {
  Job,
  Candidate,
  Assessment,
  CandidateStage,
  Question,
  AssessmentSection,
  CandidateTimelineEvent,
} from '../types';
import {
  generateId,
  randomFromArray,
  randomBoolean,
  randomNumber,
  randomDate,
  slugify,
} from '../utils';

// Sample data constants
const JOB_TITLES = [
  'Senior Frontend Developer',
  'Backend Engineer',
  'Full Stack Developer',
  'UI/UX Designer',
  'Product Manager',
  'Data Scientist',
  'DevOps Engineer',
  'Machine Learning Engineer',
  'Software Architect',
  'QA Engineer',
  'Mobile Developer',
  'Technical Writer',
  'Solutions Architect',
  'Platform Engineer',
  'Site Reliability Engineer',
  'Security Engineer',
  'Cloud Architect',
  'Database Administrator',
  'Engineering Manager',
  'Principal Engineer',
  'React Developer',
  'Node.js Developer',
  'Python Developer',
  'Java Developer',
  'Go Developer',
];

const COMPANY_LOCATIONS = [
  'San Francisco, CA',
  'New York, NY',
  'Seattle, WA',
  'Austin, TX',
  'Boston, MA',
  'Denver, CO',
  'Remote',
  'Chicago, IL',
  'Los Angeles, CA',
  'Portland, OR',
  'Nashville, TN',
  'Atlanta, GA',
  'Miami, FL',
  'Phoenix, AZ',
  'Salt Lake City, UT',
];

const JOB_TYPES: ('full-time' | 'part-time' | 'contract' | 'internship')[] = ['full-time', 'part-time', 'contract', 'internship'];

const SKILLS_TAGS = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'AWS',
  'Docker',
  'Kubernetes',
  'GraphQL',
  'REST API',
  'MongoDB',
  'PostgreSQL',
  'Redis',
  'Next.js',
  'Vue.js',
  'Angular',
  'Express',
  'Django',
  'Flask',
  'Spring Boot',
  'Microservices',
  'CI/CD',
  'Git',
  'Agile',
  'Scrum',
  'TDD',
  'Jest',
  'Cypress',
  'Figma',
  'Sketch',
  'Adobe XD',
];

const FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Charlotte', 'James', 'Amelia', 'Benjamin', 'Mia',
  'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael',
  'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Sofia', 'Samuel', 'Avery',
  'David', 'Ella', 'Joseph', 'Madison', 'Carter', 'Scarlett', 'Owen',
  'Victoria', 'Wyatt', 'Aria', 'John', 'Grace', 'Jack', 'Chloe', 'Luke',
  'Camila', 'Jayden', 'Penelope', 'Dylan', 'Riley',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
  'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts',
];

const CANDIDATE_STAGES: CandidateStage[] = [
  'applied',
  'screen',
  'tech',
  'offer',
  'hired',
  'rejected',
];

const EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'protonmail.com',
];

// Generate jobs
export const generateJobs = (count: number = 25): Job[] => {
  const jobs: Job[] = [];
  const usedSlugs = new Set<string>();

  for (let i = 0; i < count; i++) {
    const title = randomFromArray(JOB_TITLES);
    let slug = slugify(title);
    
    // Ensure unique slug
    if (usedSlugs.has(slug)) {
      slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
    }
    usedSlugs.add(slug);

    const createdAt = randomDate(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      new Date()
    ).toISOString();

    const tags: string[] = [];
    const numTags = randomNumber(2, 6);
    for (let j = 0; j < numTags; j++) {
      const tag = randomFromArray(SKILLS_TAGS);
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }

    const salaryMin = randomNumber(50, 150) * 1000;
    const salaryMax = salaryMin + randomNumber(20, 100) * 1000;

    const job: Job = {
      id: generateId(),
      title,
      slug,
      description: `We are looking for a ${title} to join our team. This is an excellent opportunity to work with cutting-edge technologies and make a significant impact on our product.`,
      status: randomBoolean() ? 'active' : 'archived',
      tags,
      order: i,
      location: randomFromArray(COMPANY_LOCATIONS),
      type: randomFromArray(JOB_TYPES),
      salary: {
        min: salaryMin,
        max: salaryMax,
        currency: 'USD',
      },
      createdAt,
      updatedAt: createdAt,
    };

    jobs.push(job);
  }

  return jobs;
};

// Generate candidates
export const generateCandidates = (jobs: Job[], count: number = 1000): Candidate[] => {
  const candidates: Candidate[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = randomFromArray(FIRST_NAMES);
    const lastName = randomFromArray(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomFromArray(EMAIL_DOMAINS)}`;
    const jobId = randomFromArray(jobs).id;
    const stage = randomFromArray(CANDIDATE_STAGES);
    
    const createdAt = randomDate(
      new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      new Date()
    ).toISOString();

    // Generate timeline events
    const timeline: CandidateTimelineEvent[] = [
      {
        id: generateId(),
        type: 'stage_change',
        description: 'Applied to position',
        newStage: 'applied',
        createdAt,
        updatedAt: createdAt,
      },
    ];

    // Add more timeline events based on current stage
    const stageOrder = ['applied', 'screen', 'tech', 'offer', 'hired'];
    const currentStageIndex = stageOrder.indexOf(stage);
    
    for (let j = 1; j <= currentStageIndex; j++) {
      const eventDate = new Date(new Date(createdAt).getTime() + j * 2 * 24 * 60 * 60 * 1000).toISOString();
      timeline.push({
        id: generateId(),
        type: 'stage_change',
        description: `Moved to ${stageOrder[j]} stage`,
        previousStage: stageOrder[j - 1] as CandidateStage,
        newStage: stageOrder[j] as CandidateStage,
        createdAt: eventDate,
        updatedAt: eventDate,
      });
    }

    const candidate: Candidate = {
      id: generateId(),
      name,
      email,
      phone: `+1${randomNumber(100, 999)}${randomNumber(100, 999)}${randomNumber(1000, 9999)}`,
      stage,
      jobId,
      notes: [],
      timeline,
      createdAt,
      updatedAt: createdAt,
    };

    candidates.push(candidate);
  }

  return candidates;
};

// Generate questions for assessments
const generateQuestions = (sectionId: string): Question[] => {
  const questions: Question[] = [
    // Single choice questions
    {
      id: generateId(),
      type: 'single-choice',
      title: 'What is your experience level with React?',
      description: 'Please select the option that best describes your React experience.',
      required: true,
      order: 1,
      options: [
        { id: generateId(), label: 'Beginner (0-1 years)', value: 'beginner' },
        { id: generateId(), label: 'Intermediate (1-3 years)', value: 'intermediate' },
        { id: generateId(), label: 'Advanced (3-5 years)', value: 'advanced' },
        { id: generateId(), label: 'Expert (5+ years)', value: 'expert' },
      ],
    },
    {
      id: generateId(),
      type: 'single-choice',
      title: 'Which testing framework do you prefer?',
      required: true,
      order: 2,
      options: [
        { id: generateId(), label: 'Jest', value: 'jest' },
        { id: generateId(), label: 'Mocha', value: 'mocha' },
        { id: generateId(), label: 'Jasmine', value: 'jasmine' },
        { id: generateId(), label: 'Cypress', value: 'cypress' },
        { id: generateId(), label: 'Other', value: 'other' },
      ],
    },
    // Multi choice questions
    {
      id: generateId(),
      type: 'multi-choice',
      title: 'Which programming languages are you proficient in?',
      description: 'Select all that apply.',
      required: true,
      order: 3,
      maxSelections: 5,
      options: [
        { id: generateId(), label: 'JavaScript', value: 'javascript' },
        { id: generateId(), label: 'TypeScript', value: 'typescript' },
        { id: generateId(), label: 'Python', value: 'python' },
        { id: generateId(), label: 'Java', value: 'java' },
        { id: generateId(), label: 'C#', value: 'csharp' },
        { id: generateId(), label: 'Go', value: 'go' },
        { id: generateId(), label: 'Rust', value: 'rust' },
      ],
    },
    // Short text questions
    {
      id: generateId(),
      type: 'short-text',
      title: 'What is your current job title?',
      required: true,
      order: 4,
      maxLength: 100,
      placeholder: 'e.g., Senior Frontend Developer',
    },
    {
      id: generateId(),
      type: 'short-text',
      title: 'How many years of professional experience do you have?',
      required: true,
      order: 5,
      maxLength: 10,
      placeholder: 'e.g., 5 years',
    },
    // Long text questions
    {
      id: generateId(),
      type: 'long-text',
      title: 'Describe your most challenging project and how you overcame the obstacles.',
      required: true,
      order: 6,
      maxLength: 1000,
      placeholder: 'Please provide details about the project, challenges faced, and your solutions...',
    },
    {
      id: generateId(),
      type: 'long-text',
      title: 'Why are you interested in this position?',
      required: true,
      order: 7,
      maxLength: 500,
      placeholder: 'Tell us what motivates you about this role...',
    },
    // Numeric questions
    {
      id: generateId(),
      type: 'numeric',
      title: 'What is your expected salary range (in USD)?',
      required: false,
      order: 8,
      min: 30000,
      max: 300000,
      step: 1000,
    },
    {
      id: generateId(),
      type: 'numeric',
      title: 'How many team members have you managed?',
      required: false,
      order: 9,
      min: 0,
      max: 50,
      step: 1,
    },
    // File upload questions
    {
      id: generateId(),
      type: 'file-upload',
      title: 'Upload your resume',
      description: 'Please upload your most recent resume.',
      required: true,
      order: 10,
      acceptedTypes: ['.pdf', '.doc', '.docx'],
      maxSize: 5, // 5MB
    },
  ];

  return questions;
};

// Generate assessments
export const generateAssessments = (jobs: Job[]): Assessment[] => {
  const assessments: Assessment[] = [];

  // Create assessments for all jobs
  const jobsToCreateAssessments = jobs;

  jobsToCreateAssessments.forEach((job, index) => {
    const sections: AssessmentSection[] = [
      {
        id: generateId(),
        title: 'Technical Background',
        description: 'Questions about your technical experience and skills.',
        order: 1,
        questions: generateQuestions('technical').slice(0, 4),
      },
      {
        id: generateId(),
        title: 'Experience & Motivation',
        description: 'Questions about your professional experience and interest in the role.',
        order: 2,
        questions: generateQuestions('experience').slice(4, 8),
      },
      {
        id: generateId(),
        title: 'Additional Information',
        description: 'Optional questions to help us learn more about you.',
        order: 3,
        questions: generateQuestions('additional').slice(8),
      },
    ];

    const createdAt = job.createdAt;

    const assessment: Assessment = {
      id: generateId(),
      jobId: job.id,
      title: `${job.title} Assessment`,
      description: `Assessment for the ${job.title} position. This will help us understand your background and suitability for the role.`,
      sections,
      isPublished: true, // Always publish assessments for candidates
      timeLimit: randomNumber(30, 120), // 30-120 minutes
      createdAt,
      updatedAt: createdAt,
    };

    assessments.push(assessment);
  });

  return assessments;
};

// Main seed function
export const generateSeedData = () => {
  console.log('🌱 Generating seed data...');
  
  const jobs = generateJobs(25);
  console.log(`✅ Generated ${jobs.length} jobs`);
  
  const candidates = generateCandidates(jobs, 1000);
  console.log(`✅ Generated ${candidates.length} candidates`);
  
  const assessments = generateAssessments(jobs);
  console.log(`✅ Generated ${assessments.length} assessments`);

  return {
    jobs,
    candidates,
    assessments,
  };
};

// Utility to seed data to storage
export const seedDataToStorage = async () => {
  const { StorageService } = await import('./storage');
  
  try {
    // Check if data already exists
    const existingInfo = await StorageService.getStorageInfo();
    console.log('📁 Current storage info:', existingInfo);
    
    // Always force regeneration of data for now to fix assessment issues
    console.log('🔄 Force regenerating all data to ensure assessments are properly created...');

    const { jobs, candidates, assessments } = generateSeedData();

    // Clear existing data first
    console.log('🗑️ Clearing existing data...');
    await StorageService.clearAllData();
    
    // Save to storage
    console.log('💾 Saving jobs to storage...');
    for (const job of jobs) {
      await StorageService.saveJob(job);
    }
    
    console.log('💾 Saving candidates to storage...');
    for (const candidate of candidates) {
      await StorageService.saveCandidate(candidate);
    }
    
    console.log('💾 Saving assessments to storage...');
    for (const assessment of assessments) {
      console.log(`📝 Saving assessment for job ${assessment.jobId}: ${assessment.title}`);
      await StorageService.saveAssessment(assessment);
    }
    
    console.log('✅ All data saved successfully!');

    console.log('✅ Seed data saved to storage successfully!');
    
    return await StorageService.getStorageInfo();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
};

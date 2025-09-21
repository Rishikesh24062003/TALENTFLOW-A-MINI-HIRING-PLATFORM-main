import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { makeServer } from './api/mirage';
import { useAppInitialization } from './hooks';
import { useAppStore } from './store';
import { Layout } from './components/Layout';
import { AuthPage } from './pages/AuthPage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { CandidatesPage } from './pages/CandidatesPage';
import { CandidateDetailPage } from './pages/CandidateDetailPage';
import { CandidatePortalPage } from './pages/CandidatePortalPage';
import { CandidateDashboardPage } from './pages/CandidateDashboardPage';
import { CandidateJobDetailPage } from './pages/CandidateJobDetailPage';
import { JobApplicationPage } from './pages/JobApplicationPage';
import { TakeAssessmentPage } from './pages/TakeAssessmentPage';
import { ClearDataPage } from './pages/ClearDataPage';
import { ForceResetPage } from './pages/ForceResetPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toast } from './components/ui/Toast';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

// Start Mirage server in development
if (process.env.NODE_ENV === 'development') {
  makeServer();
}

// App initialization component
const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, error } = useAppInitialization();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Initializing TalentFlow...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Initialization Error
          </h2>
          <p className="text-gray-600 mb-4">
            Failed to initialize the application. Please refresh and try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Role-based Route Components
const HRProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAppStore();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Only allow HR, Admin, Recruiter roles
  if (user.role === 'candidate') {
    return <Navigate to="/candidate-portal" replace />;
  }
  
  return <>{children}</>;
};

const CandidateProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAppStore();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Only allow candidates
  if (user.role !== 'candidate') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Main App component
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppInitializer>
            <div className="App">
              <Routes>
                {/* Auth route - accessible without login */}
                <Route path="/auth" element={<AuthPage />} />
                
                {/* Candidate routes - standalone for candidates */}
                <Route 
                  path="/candidate-dashboard" 
                  element={
                    <CandidateProtectedRoute>
                      <CandidateDashboardPage />
                    </CandidateProtectedRoute>
                  } 
                />
                <Route 
                  path="/candidate-portal" 
                  element={
                    <CandidateProtectedRoute>
                      <CandidatePortalPage />
                    </CandidateProtectedRoute>
                  } 
                />
                <Route 
                  path="/candidate/jobs/:jobId" 
                  element={
                    <CandidateProtectedRoute>
                      <CandidateJobDetailPage />
                    </CandidateProtectedRoute>
                  } 
                />
                <Route 
                  path="/candidate/jobs/:jobId/apply" 
                  element={
                    <CandidateProtectedRoute>
                      <JobApplicationPage />
                    </CandidateProtectedRoute>
                  } 
                />
                <Route 
                  path="/candidate/jobs/:jobId/assessment" 
                  element={
                    <CandidateProtectedRoute>
                      <TakeAssessmentPage />
                    </CandidateProtectedRoute>
                  } 
                />
                <Route 
                  path="/clear-data" 
                  element={<ClearDataPage />} 
                />
                <Route 
                  path="/force-reset" 
                  element={<ForceResetPage />} 
                />
                
                {/* Redirect candidates to their dashboard by default */}
                <Route 
                  path="/candidate" 
                  element={<Navigate to="/candidate-dashboard" replace />} 
                />
                
                {/* Protected HR/Admin routes with Layout */}
                <Route 
                  path="/" 
                  element={
                    <HRProtectedRoute>
                      <Layout />
                    </HRProtectedRoute>
                  }
                >
                  {/* Dashboard */}
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  
                  {/* Jobs routes */}
                  <Route path="jobs" element={<JobsPage />} />
                  <Route path="jobs/:jobId" element={<JobDetailPage />} />
                  
                  {/* Candidates routes */}
                  <Route path="candidates" element={<CandidatesPage />} />
                  <Route path="candidates/:candidateId" element={<CandidateDetailPage />} />
                  
                  {/* Assessments routes */}
                  <Route path="assessments" element={<AssessmentsPage />} />
                  <Route path="assessments/:jobId" element={<AssessmentsPage />} />
                  
                  {/* Catch all - redirect to dashboard */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Routes>
              
              {/* Global components */}
              <Toast />
            </div>
          </AppInitializer>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

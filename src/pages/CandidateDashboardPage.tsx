import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BriefcaseIcon, 
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useAppStore } from '../store';
import { useJobs } from '../hooks';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { cn } from '../utils';

interface DashboardStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: 'blue' | 'green' | 'purple' | 'orange';
  description?: string;
  href?: string;
}

const DashboardStatsCard: React.FC<DashboardStatsCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  description,
  href 
}) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-100',
    green: 'bg-green-500 text-green-100',
    purple: 'bg-purple-500 text-purple-100',
    orange: 'bg-orange-500 text-orange-100',
  };

  const content = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={cn('p-3 rounded-md', colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="text-2xl font-semibold text-gray-900">
              {value}
            </dd>
            {description && (
              <dd className="text-sm text-gray-600 mt-1">
                {description}
              </dd>
            )}
          </dl>
        </div>
      </div>
    </motion.div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
};

interface ApplicationStatusItem {
  id: string;
  jobTitle: string;
  company: string;
  stage: 'applied' | 'screen' | 'tech' | 'offer' | 'hired' | 'rejected';
  appliedDate: string;
  lastUpdate: string;
}

const ApplicationStatusCard: React.FC = () => {
  // Mock data for candidate applications
  const applications: ApplicationStatusItem[] = [
    {
      id: '1',
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp',
      stage: 'tech',
      appliedDate: '2024-01-15',
      lastUpdate: '2024-01-20'
    },
    {
      id: '2',
      jobTitle: 'React Developer',
      company: 'StartupXYZ',
      stage: 'screen',
      appliedDate: '2024-01-18',
      lastUpdate: '2024-01-19'
    },
    {
      id: '3',
      jobTitle: 'Full Stack Engineer',
      company: 'BigTech Inc',
      stage: 'applied',
      appliedDate: '2024-01-22',
      lastUpdate: '2024-01-22'
    }
  ];

  const getStageInfo = (stage: ApplicationStatusItem['stage']) => {
    switch (stage) {
      case 'applied':
        return { label: 'Application Submitted', color: 'bg-blue-100 text-blue-800' };
      case 'screen':
        return { label: 'Initial Screening', color: 'bg-yellow-100 text-yellow-800' };
      case 'tech':
        return { label: 'Technical Interview', color: 'bg-purple-100 text-purple-800' };
      case 'offer':
        return { label: 'Offer Extended', color: 'bg-green-100 text-green-800' };
      case 'hired':
        return { label: 'Hired', color: 'bg-green-100 text-green-800' };
      case 'rejected':
        return { label: 'Not Selected', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Application Status</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {applications.map((application) => {
          const stageInfo = getStageInfo(application.stage);
          return (
            <div key={application.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {application.jobTitle}
                  </p>
                  <p className="text-sm text-gray-500">
                    {application.company} • Applied {new Date(application.appliedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    stageInfo.color
                  )}>
                    {stageInfo.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-6 py-4 border-t border-gray-200">
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link to="/candidate-portal">
            View All Applications
          </Link>
        </Button>
      </div>
    </div>
  );
};

interface UpcomingActivityItem {
  id: string;
  type: 'assessment' | 'interview' | 'deadline';
  title: string;
  description: string;
  date: string;
  time?: string;
}

const UpcomingActivitiesCard: React.FC = () => {
  const activities: UpcomingActivityItem[] = [
    {
      id: '1',
      type: 'assessment',
      title: 'Frontend Skills Assessment',
      description: 'Complete the React and JavaScript assessment for TechCorp',
      date: '2024-01-25',
      time: '2:00 PM'
    },
    {
      id: '2',
      type: 'interview',
      title: 'Technical Interview',
      description: 'Video call with StartupXYZ engineering team',
      date: '2024-01-28',
      time: '10:00 AM'
    },
    {
      id: '3',
      type: 'deadline',
      title: 'Application Deadline',
      description: 'Full Stack Engineer at BigTech Inc',
      date: '2024-01-30'
    }
  ];

  const getActivityIcon = (type: UpcomingActivityItem['type']) => {
    switch (type) {
      case 'assessment':
        return <DocumentTextIcon className="h-5 w-5 text-purple-500" />;
      case 'interview':
        return <UserIcon className="h-5 w-5 text-blue-500" />;
      case 'deadline':
        return <ClockIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <CalendarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Upcoming Activities</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {activity.description}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(activity.date).toLocaleDateString()}
                  {activity.time && ` at ${activity.time}`}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t border-gray-200">
        <Button variant="outline" size="sm" className="w-full">
          View Calendar
        </Button>
      </div>
    </div>
  );
};

export const CandidateDashboardPage: React.FC = () => {
  const { user } = useAppStore();
  const { data: jobsData, isLoading: jobsLoading } = useJobs({ pageSize: 100 });

  if (jobsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalJobs = jobsData?.data?.filter((job: any) => job.status === 'active').length || 0;
  const myApplications = 3; // Mock data - would come from API
  const pendingAssessments = 1; // Mock data
  const interviewsScheduled = 1; // Mock data

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center min-w-0">
              <BriefcaseIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 truncate">TalentFlow</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:block text-sm text-gray-700 truncate">
                Welcome back, {user?.name}!
              </span>
              <Button variant="secondary" size="sm" asChild>
                <Link to="/candidate-portal">
                  Browse Jobs
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
              <p className="text-blue-100 mt-1">
                Here's your application progress and upcoming activities.
              </p>
            </div>
            <div className="hidden sm:block">
              <Button variant="secondary" asChild>
                <Link to="/candidate-portal">
                  <BriefcaseIcon className="h-4 w-4 mr-2" />
                  Find New Jobs
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <DashboardStatsCard
            title="My Applications"
            value={myApplications}
            icon={BriefcaseIcon}
            color="blue"
            description="Active applications"
          />
          <DashboardStatsCard
            title="Pending Assessments"
            value={pendingAssessments}
            icon={DocumentTextIcon}
            color="purple"
            description="Waiting for completion"
          />
          <DashboardStatsCard
            title="Interviews Scheduled"
            value={interviewsScheduled}
            icon={CalendarIcon}
            color="green"
            description="This week"
          />
          <DashboardStatsCard
            title="Available Jobs"
            value={totalJobs}
            icon={EyeIcon}
            color="orange"
            description="Open positions"
            href="/candidate-portal"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Status */}
          <div className="lg:col-span-2">
            <ApplicationStatusCard />
          </div>

          {/* Upcoming Activities */}
          <div>
            <UpcomingActivitiesCard />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="primary" className="w-full" asChild>
                <Link to="/candidate-portal">
                  <BriefcaseIcon className="h-4 w-4 mr-2" />
                  Browse Jobs
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/candidate-portal">
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  View Assessments
                </Link>
              </Button>
              <Button variant="outline" className="w-full">
                <UserIcon className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
              <Button variant="outline" className="w-full">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

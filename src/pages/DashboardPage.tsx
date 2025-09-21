import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BriefcaseIcon, 
  UsersIcon, 
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { useJobs, useCandidates } from '../hooks';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { HROnly } from '../components/ui/RoleBasedAccess';
import { cn } from '../utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: 'blue' | 'green' | 'purple' | 'orange';
  href?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color, 
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
      className="card p-6 hover:shadow-md transition-all duration-200"
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
            {change && (
              <dd className="flex items-center text-sm">
                {change.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={cn(
                  'font-medium',
                  change.trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}>
                  {Math.abs(change.value)}%
                </span>
                <span className="text-gray-500 ml-1">vs last month</span>
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

interface RecentActivityItem {
  id: string;
  type: 'job_created' | 'candidate_applied' | 'assessment_completed' | 'stage_changed';
  title: string;
  description: string;
  time: string;
  href?: string;
}

const RecentActivity: React.FC = () => {
  const activities: RecentActivityItem[] = [
    {
      id: '1',
      type: 'candidate_applied',
      title: 'New Application',
      description: 'John Doe applied for Senior Frontend Developer',
      time: '2 hours ago',
      href: '/candidates/john-doe',
    },
    {
      id: '2',
      type: 'assessment_completed',
      title: 'Assessment Completed',
      description: 'Sarah Wilson completed React Developer assessment',
      time: '4 hours ago',
      href: '/assessments/react-dev',
    },
    {
      id: '3',
      type: 'stage_changed',
      title: 'Candidate Advanced',
      description: 'Mike Johnson moved to Technical Interview stage',
      time: '6 hours ago',
      href: '/candidates/mike-johnson',
    },
    {
      id: '4',
      type: 'job_created',
      title: 'New Job Posted',
      description: 'Backend Engineer position created and published',
      time: '1 day ago',
      href: '/jobs/backend-engineer',
    },
  ];

  const getActivityIcon = (type: RecentActivityItem['type']) => {
    switch (type) {
      case 'job_created':
        return <BriefcaseIcon className="h-5 w-5 text-blue-500" />;
      case 'candidate_applied':
        return <UsersIcon className="h-5 w-5 text-green-500" />;
      case 'assessment_completed':
        return <DocumentTextIcon className="h-5 w-5 text-purple-500" />;
      case 'stage_changed':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <EyeIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="card">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {activities.map((activity) => (
          <div key={activity.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500">
                  {activity.description}
                </p>
              </div>
              <div className="flex-shrink-0 text-sm text-gray-500">
                {activity.time}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t border-gray-200">
        {/* <Button variant="outline" size="sm" className="w-full">
          View all activity
        </Button> */}
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const { data: jobsData, isLoading: jobsLoading } = useJobs({ pageSize: 100 }); // Get more jobs for stats
  const { data: candidatesData, isLoading: candidatesLoading } = useCandidates({ pageSize: 100 }); // Get more candidates for stats

  const isLoading = jobsLoading || candidatesLoading;

  // Debug logging
  React.useEffect(() => {
    console.log('🏠 Dashboard: Jobs data:', jobsData);
    console.log('🏠 Dashboard: Candidates data:', candidatesData);
    console.log('🏠 Dashboard: Loading states - jobs:', jobsLoading, 'candidates:', candidatesLoading);
  }, [jobsData, candidatesData, jobsLoading, candidatesLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Calculate stats from actual data
  const totalJobs = jobsData?.total || 0;
  const activeJobs = jobsData?.data?.filter((job: any) => job.status === 'active').length || 0;
  const totalCandidates = candidatesData?.total || 0;
  
  // Mock some additional stats for now
  const assessmentsCount = 12;

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back!</h1>
            <p className="text-primary-100 mt-1">
              Here's what's happening with your hiring pipeline today.
            </p>
          </div>
          <HROnly>
            <div className="hidden sm:block">
              <Button variant="secondary" asChild>
                <Link to="/jobs">
                  Create New Job
                </Link>
              </Button>
            </div>
          </HROnly>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Jobs"
          value={totalJobs}
          change={{ value: 12, trend: 'up' }}
          icon={BriefcaseIcon}
          color="blue"
          href="/jobs"
        />
        <StatsCard
          title="Active Jobs"
          value={activeJobs}
          change={{ value: 8, trend: 'up' }}
          icon={BriefcaseIcon}
          color="green"
          href="/jobs?status=active"
        />
        <StatsCard
          title="Total Candidates"
          value={totalCandidates}
          change={{ value: 23, trend: 'up' }}
          icon={UsersIcon}
          color="purple"
          href="/candidates"
        />
        <StatsCard
          title="Assessments"
          value={assessmentsCount}
          change={{ value: 5, trend: 'down' }}
          icon={DocumentTextIcon}
          color="orange"
          href="/assessments"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Quick actions */}
        <div className="space-y-6">
          <HROnly>
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="primary" className="w-full" asChild>
                  <Link to="/jobs?action=create">
                    <BriefcaseIcon className="h-4 w-4 mr-2" />
                    Create Job
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/candidates">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    View Candidates
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/assessments">
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Manage Assessments
                  </Link>
                </Button>
              </div>
            </div>
          </HROnly>

          {/* Pipeline overview */}
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pipeline Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Applied</span>
                <span className="text-sm font-medium">324</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Screening</span>
                <span className="text-sm font-medium">89</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Technical</span>
                <span className="text-sm font-medium">32</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Offer</span>
                <span className="text-sm font-medium">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hired</span>
                <span className="text-sm font-medium text-green-600">8</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

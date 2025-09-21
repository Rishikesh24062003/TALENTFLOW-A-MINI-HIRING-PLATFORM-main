import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Job } from '../../types';
import { useCreateJob, useUpdateJob } from '../../hooks';
import { useUIStore } from '../../store';
import { slugify, isValidSlug } from '../../utils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X } from 'lucide-react';

interface JobFormProps {
  job?: Job | null;
  onSuccess?: () => void;
}

interface JobFormData {
  title: string;
  slug: string;
  description: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  status: 'active' | 'archived';
  tags: string;
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}

export const JobForm: React.FC<JobFormProps> = ({ job, onSuccess }) => {
  const { closeModal } = useUIStore();
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  
  const isEditing = !!job;
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<JobFormData>({
    defaultValues: {
      title: job?.title || '',
      slug: job?.slug || '',
      description: job?.description || '',
      location: job?.location || '',
      type: job?.type || 'full-time',
      status: job?.status || 'active',
      tags: job?.tags?.join(', ') || '',
      salary: job?.salary || {
        min: 50000,
        max: 100000,
        currency: 'USD'
      }
    }
  });

  const watchedTitle = watch('title');

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing && watchedTitle) {
      const generatedSlug = slugify(watchedTitle);
      setValue('slug', generatedSlug);
    }
  }, [watchedTitle, setValue, isEditing]);

  const onSubmit = async (data: JobFormData) => {
    try {
      const jobData = {
        ...data,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        order: job?.order || 0,
      };

      if (isEditing && job) {
        await updateJobMutation.mutateAsync({
          id: job.id,
          updates: jobData
        });
      } else {
        await createJobMutation.mutateAsync(jobData);
      }

      closeModal('jobForm');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save job:', error);
    }
  };

  const handleClose = () => {
    reset();
    closeModal('jobForm');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Job' : 'Create New Job'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Job Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Job Title *
            </label>
            <Input
              id="title"
              {...register('title', { 
                required: 'Job title is required',
                minLength: { value: 2, message: 'Title must be at least 2 characters' }
              })}
              placeholder="e.g., Senior Frontend Developer"
              error={errors.title?.message}
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              URL Slug *
            </label>
            <Input
              id="slug"
              {...register('slug', { 
                required: 'Slug is required',
                validate: value => isValidSlug(value) || 'Slug must contain only lowercase letters, numbers, and hyphens'
              })}
              placeholder="e.g., senior-frontend-developer"
              error={errors.slug?.message}
            />
            <p className="text-xs text-gray-500 mt-1">
              Used in the job URL. Will be auto-generated from title.
            </p>
          </div>

          {/* Location and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <Input
                id="location"
                {...register('location', { required: 'Location is required' })}
                placeholder="e.g., San Francisco, CA or Remote"
                error={errors.location?.message}
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Job Type *
              </label>
              <select
                id="type"
                {...register('type', { required: 'Job type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Salary Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salary Range (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="salaryMin" className="block text-xs text-gray-500 mb-1">
                  Minimum
                </label>
                <Input
                  id="salaryMin"
                  type="number"
                  {...register('salary.min', { valueAsNumber: true })}
                  placeholder="50000"
                />
              </div>
              <div>
                <label htmlFor="salaryMax" className="block text-xs text-gray-500 mb-1">
                  Maximum
                </label>
                <Input
                  id="salaryMax"
                  type="number"
                  {...register('salary.max', { valueAsNumber: true })}
                  placeholder="100000"
                />
              </div>
              <div>
                <label htmlFor="salaryCurrency" className="block text-xs text-gray-500 mb-1">
                  Currency
                </label>
                <select
                  id="salaryCurrency"
                  {...register('salary.currency')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Skills & Tags
            </label>
            <Input
              id="tags"
              {...register('tags')}
              placeholder="React, TypeScript, Node.js, AWS"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate tags with commas
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Job Description *
            </label>
            <textarea
              id="description"
              rows={6}
              {...register('description', { 
                required: 'Job description is required',
                minLength: { value: 50, message: 'Description must be at least 50 characters' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Describe the role, responsibilities, requirements, and what makes this position exciting..."
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isEditing ? 'Update Job' : 'Create Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

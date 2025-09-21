import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { authApi } from '../api/services';
import { useUIStore } from '../store';

type AuthMode = 'signin' | 'signup';
type UserType = 'hr' | 'candidate';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [userType, setUserType] = useState<UserType>('hr');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAppStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (authMode === 'signup') {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
    }

    // Name validation for signup
    if (authMode === 'signup') {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters long';
      }

      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      let user;
      
      if (authMode === 'signup') {
        // Handle user registration
        user = await authApi.signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: userType
        });
        
        addToast({
          title: 'Account Created',
          description: 'Welcome to TalentFlow! Your account has been created successfully.',
          type: 'success'
        });
      } else {
        // Handle user login
        user = await authApi.signin({
          email: formData.email,
          password: formData.password
        });
        
        addToast({
          title: 'Welcome Back',
          description: `Successfully signed in as ${user.name}`,
          type: 'success'
        });
      }

      setUser(user);
      
      // Redirect based on user role
      if (user.role === 'hr' || user.role === 'recruiter' || user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/candidate-dashboard');
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (authMode === 'signin') {
        errorMessage = 'Invalid email or password';
      } else {
        errorMessage = 'Failed to create account. Please try again.';
      }
      
      setErrors({ general: errorMessage });
      
      addToast({
        title: 'Authentication Failed',
        description: errorMessage,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear field-specific error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'signin' ? 'signup' : 'signin');
    setErrors({});
    // Keep email but clear other fields when switching modes
    setFormData(prev => ({
      name: '',
      email: prev.email,
      password: '',
      confirmPassword: ''
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {authMode === 'signin' ? 'Sign in to TalentFlow' : 'Create your TalentFlow account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {authMode === 'signin' 
              ? 'Welcome back! Please sign in to continue.' 
              : 'Join TalentFlow to start managing your recruitment process.'
            }
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Display */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{errors.general}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* User Type Selection - Only show for signup */}
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am a:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setUserType('hr')}
                    className={`p-4 text-center rounded-lg border-2 transition-colors ${
                      userType === 'hr'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">HR/Recruiter</div>
                    <div className="text-sm text-gray-500">
                      Manage jobs & candidates
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('candidate')}
                    className={`p-4 text-center rounded-lg border-2 transition-colors ${
                      userType === 'candidate'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Job Candidate</div>
                    <div className="text-sm text-gray-500">
                      Apply & take assessments
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Name Input - Only show for signup */}
            {authMode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  placeholder="Enter your full name"
                  className={`mt-1 ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  required={authMode === 'signup'}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="Enter your email address"
                className={`mt-1 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                required
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                placeholder={authMode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                className={`mt-1 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                required
                autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              {authMode === 'signup' && (
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              )}
            </div>

            {/* Confirm Password Input - Only show for signup */}
            {authMode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password *
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  placeholder="Confirm your password"
                  className={`mt-1 ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  required={authMode === 'signup'}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            )}
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {authMode === 'signup' ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                authMode === 'signup' ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </div>

          {/* Auth Mode Toggle */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              disabled={isLoading}
            >
              {authMode === 'signin' 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>

          {/* Demo Note */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              {authMode === 'signin' 
                ? 'This is a demo application. Use any registered email/password.' 
                : 'This is a demo application. Your account will be created for testing purposes.'
              }
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

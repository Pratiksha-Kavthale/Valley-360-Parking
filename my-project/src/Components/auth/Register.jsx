import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { useNotification } from '../../contexts';
import { AuthLayout } from '../layouts';
import Button from '../ui/Button';
import Input, { Select } from '../ui/Input';
import { validateEmail, validatePhone, validatePassword } from '../../utils/helpers';


const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const { success, error: showError } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    address: '',
    role: 'ROLE_CUSTOMER',
    employeeId: '',
  });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1);

  const roleOptions = [
    { value: 'ROLE_CUSTOMER', label: 'Customer - Find & Book Parking' },
    { value: 'ROLE_OWNER', label: 'Owner - List Your Parking Spaces' },
    { value: 'ROLE_ADMIN', label: 'Admin - Manage Platform' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Phone number is required';
    } else if (!validatePhone(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit phone number';
    }

    // Validate employee ID if admin role is selected
    if (formData.role === 'ROLE_ADMIN' && !formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required for Admin registration';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    // Split name into first and last name
    const nameParts = formData.name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    const userData = {
      firstName: firstName,
      lastName: lastName,
      email: formData.email.toLowerCase(),
      password: formData.password,
      contact: formData.mobileNumber,
      address: formData.address.trim(),
      userRoles: [formData.role],
    };

    let result;
    
    if (formData.role === 'ROLE_ADMIN') {
      // Admin registration with employee ID verification
      try {
        const response = await fetch(`https://spirited-essence-production.up.railway.app/Admin/Register?employeeId=${formData.employeeId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });
        
        if (response.ok) {
          result = { success: true };
        } else {
          const errorData = await response.json();
          result = { success: false, error: errorData.message || 'Invalid Employee ID or registration failed' };
        }
      } catch (err) {
        result = { success: false, error: 'Admin registration failed. Please check your Employee ID.' };
      }
    } else {
      // Regular user registration
      result = await register(userData);
    }
    
    if (result.success) {
      success('Registration successful! Please login to continue.');
      navigate('/Login');
    } else {
      showError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <AuthLayout 
      title="Create your account" 
      subtitle="Join Valley 360 and start parking smarter"
    >
      <form onSubmit={handleSubmit}>
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 1 ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                1
              </div>
              <span className={`text-sm font-medium ${
                step >= 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400'
              }`}>
                Personal Info
              </span>
            </div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 2 ? 'bg-rose-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
              }`}>
                2
              </div>
              <span className={`text-sm font-medium ${
                step >= 2 ? 'text-slate-900 dark:text-white' : 'text-slate-400'
              }`}>
                Account Setup
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              error={errors.name}
              required
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={errors.email}
              required
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />

            <Input
              label="Phone Number"
              type="tel"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="9876543210"
              error={errors.mobileNumber}
              required
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              }
            />

            <Select
              label="I want to"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={roleOptions}
              placeholder="Select your role"
            />

            {/* Employee ID field - only shown when Admin role is selected */}
            {formData.role === 'ROLE_ADMIN' && (
              <Input
                label="Employee ID"
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="Enter your Employee ID"
                error={errors.employeeId}
                required
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                }
              />
            )}

            <Button
              type="button"
              fullWidth
              onClick={handleNext}
              className="py-3"
            >
              Continue
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </div>
        )}

        {/* Step 2: Account Setup */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              error={errors.password}
              required
              hint="At least 8 characters with uppercase, lowercase, and number"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              error={errors.confirmPassword}
              required
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            />

            <Input
              label="Address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your full address"
              error={errors.address}
              required
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />

            {/* Terms & Conditions */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                I agree to the{' '}
                <Link to="/terms" className="text-rose-500 hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-rose-500 hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleBack}
                className="flex-1 py-3"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                Back
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1 py-3"
              >
                Create Account
              </Button>
            </div>
          </div>
        )}

        {/* Login Link */}
        <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/Login" className="font-semibold text-rose-500 hover:text-rose-600">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;

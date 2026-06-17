import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import api from '/src/api';
import { Link } from 'react-router-dom';

// Function to validate the password
const validatePassword = (password) => {
    const minLength = 8;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;
    const uppercase = /[A-Z]/;
    const number = /[0-9]/;

    return (
        password.length >= minLength &&
        specialChar.test(password) &&
        uppercase.test(password) &&
        number.test(password)
    );
};

const Registration = () => {
    // State variables for form inputs
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [contact, setContact] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [roleId, setRoleId] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [error, setError] = useState('');

    // Handler for form submission
    const handleSignup = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setError('');

        // Validate password
        if (!validatePassword(password)) {
            setPasswordError('Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 special character, and a combination of digits and letters.');
            return;
        } else {
            setPasswordError('');
        }

        // Validate employee ID for admin registration
        if (roleId === '1' && !employeeId.trim()) {
            setError('Employee ID is required for Admin registration');
            return;
        }

        try {
            // Check if registering as admin
            if (roleId === '1') {
                // Admin registration with employee ID verification
                const response = await fetch(`http://localhost:8080/Admin/Register?employeeId=${employeeId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        firstName,
                        lastName,
                        email,
                        password,
                        contact,
                        gender,
                        address,
                    }),
                });

                if (response.ok) {
                    toast.success("Admin Registration Successful!");
                    window.location.href = '/';
                } else {
                    const errorData = await response.json();
                    setError(errorData.message || 'Invalid Employee ID or registration failed');
                }
            } else {
                // Regular user registration
                await api.post('http://localhost:8080/User/Register', {
                    firstName,
                    lastName,
                    email,
                    password,
                    contact,
                    gender,
                    address,
                    roleId: parseInt(roleId, 10),
                });

                toast.success("Signup Successful!");
                window.location.href = '/';
            }

        } catch (error) {
            if (error.response && error.response.status === 409) {
                setError(error.response.data.message);
            } else {
                setError('Something went wrong');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-rose-500 via-rose-500 to-orange-500 p-12 flex-col justify-between relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        V
                    </div>
                    <span className="text-xl font-bold text-white">Valley 360</span>
                </Link>

                {/* Content */}
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Join Valley 360
                    </h1>
                    <p className="text-white/90 text-lg leading-relaxed">
                        Create your account and start finding the perfect parking spot today.
                    </p>

                    {/* Features */}
                    <div className="mt-8 space-y-4">
                        {['Register as Customer or Owner', 'Easy booking process', 'Secure & reliable platform'].map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 text-white">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-white/70 text-sm">
                    © 2026 Valley 360 Parking. All rights reserved.
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-8 lg:px-12 overflow-y-auto">
                <div className="mx-auto w-full max-w-lg">
                    {/* Mobile Logo */}
                    <Link to="/" className="lg:hidden flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                            V
                        </div>
                        <span className="text-lg font-bold text-slate-900">Valley 360</span>
                    </Link>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
                        <p className="mt-2 text-slate-600">
                            Fill in your details to get started
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                                <input
                                    type="text"
                                    placeholder="John"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                                    value={firstName}
                                    onChange={(e) => { setError(''); setFirstName(e.target.value); }}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                                <input
                                    type="text"
                                    placeholder="Doe"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                                    value={lastName}
                                    onChange={(e) => { setError(''); setLastName(e.target.value); }}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                                value={email}
                                onChange={(e) => { setError(''); setEmail(e.target.value); }}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                            <input
                                type="password"
                                placeholder="Create a strong password"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                                value={password}
                                onChange={(e) => { setError(''); setPassword(e.target.value); }}
                                required
                            />
                            {passwordError && <p className="text-red-500 text-sm mt-1.5">{passwordError}</p>}
                            <p className="text-xs text-slate-500 mt-1.5">Min 8 characters, 1 uppercase, 1 number, 1 special character</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                            <input
                                type="tel"
                                placeholder="9876543210"
                                pattern="[0-9]{10}"
                                title="Please enter a 10-digit phone number"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                                value={contact}
                                onChange={(e) => { setError(''); setContact(e.target.value); }}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                            <input
                                type="text"
                                placeholder="Your full address"
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                                value={address}
                                onChange={(e) => { setError(''); setAddress(e.target.value); }}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
                                <select
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors appearance-none bg-white"
                                    value={gender}
                                    onChange={(e) => { setError(''); setGender(e.target.value); }}
                                    required
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">I want to</label>
                                <select
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors appearance-none bg-white"
                                    value={roleId}
                                    onChange={(e) => { setError(''); setRoleId(e.target.value); }}
                                    required
                                >
                                    <option value="">Select Role</option>
                                    <option value="3">Book Parking (Customer)</option>
                                    <option value="2">List Parking (Owner)</option>
                                    <option value="1">Admin (Platform Manager)</option>
                                </select>
                            </div>
                        </div>

                        {/* Employee ID field - only shown when Admin role is selected */}
                        {roleId === '1' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Employee ID</label>
                                <input
                                    type="text"
                                    placeholder="Enter your Employee ID"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                                    value={employeeId}
                                    onChange={(e) => { setError(''); setEmployeeId(e.target.value); }}
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1.5">Contact system administrator for Employee ID</p>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-rose-600 hover:to-orange-600 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
                            >
                                Create Account
                            </button>
                        </div>

                        <p className="text-center text-sm text-slate-600 pt-2">
                            Already have an account?{' '}
                            <Link to="/Login" className="font-semibold text-rose-500 hover:text-rose-600">
                                Sign in
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default Registration;



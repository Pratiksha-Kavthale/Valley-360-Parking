import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '/src/api';

const LoginAdmin = () => {
    const [user, setUser] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        api.post('http://localhost:8080/Admin/Login', null, {
            params: {
                email: user.email,
                password: user.password
            }
        })
            .then(response => {
                // Store admin session data
                if (response.data) {
                    const token = response.data.token || response.data.jwt || response.data.jwtToken;
                    localStorage.setItem('token', token);
                    sessionStorage.setItem('jwtToken', token);
                    sessionStorage.setItem('role', 'ROLE_ADMIN');
                    sessionStorage.setItem('user', JSON.stringify(response.data.user || response.data));
                }
                // Redirect to admin dashboard
                window.location.href = '/Admin';
            })
            .catch(error => {
                console.error('There was an error!', error);
                setError('Invalid credentials. Please try again.');
            });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-rose-500 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
                </div>

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center text-white font-bold text-lg border border-white/20">
                        V
                    </div>
                    <span className="text-xl font-bold text-white">Valley 360</span>
                </Link>

                {/* Content */}
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 px-3 py-1.5 rounded-full text-sm mb-4">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Admin Portal
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Administrative Access
                    </h1>
                    <p className="text-slate-300 text-lg leading-relaxed">
                        Secure login for system administrators. Manage users, parking areas, and platform settings.
                    </p>

                    {/* Admin Features */}
                    <div className="mt-8 space-y-4">
                        {['Manage all users & owners', 'Monitor platform activity', 'View analytics & reports'].map((feature, index) => (
                            <div key={index} className="flex items-center gap-3 text-slate-300">
                                <svg className="w-5 h-5 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-slate-500 text-sm">
                    © 2026 Valley 360 Parking. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
                <div className="mx-auto w-full max-w-md">
                    {/* Mobile Logo */}
                    <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-white font-bold">
                            V
                        </div>
                        <span className="text-lg font-bold text-slate-900">Valley 360</span>
                    </Link>

                    <div className="mb-8">
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Admin Portal
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Administrator Login</h2>
                        <p className="mt-2 text-slate-600">
                            Enter your admin credentials to access the dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Admin Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={user.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-colors"
                                placeholder="admin@valley360.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={user.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500 transition-colors"
                                placeholder="Enter admin password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 px-4 bg-slate-800 text-white font-semibold rounded-lg shadow-lg hover:bg-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                        >
                            Sign In as Admin
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-slate-50 text-slate-500">Or</span>
                            </div>
                        </div>

                        <Link
                            to="/Login"
                            className="w-full py-2.5 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            User Login
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginAdmin;



import { useState } from 'react';
import api from '/src/api';
import { Link, useNavigate } from 'react-router-dom';
import { isOwnerPaymentSetupComplete } from '../../utils/paymentSetup';

const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
};

const Login = () => {
  const [user, setUser] = useState({ email: '', password: '' });
  const [error, setError] = useState(null); // State to hold error messages
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("email", user.email);
      console.log("password", user.password);
      const response = await api.post('http://localhost:8080/User/Login', null, {
        params: {
          email: user.email,
          password: user.password,
        },
          headers: {
            'Authorization': 'Bearer ' + btoa('username:password')
          }
        
      });
      console.log('Login response:', response.data.userRoles);
      //const { token, loggedInUser } = response.data;
      const token = response.data.token || response.data.jwtToken;
      const loggedInUser = response.data;
      const decoded = decodeToken(token);

      // Store the token and user details for authenticated API access.
      localStorage.setItem('token', token);
      sessionStorage.setItem('jwtToken', token);
      if (decoded?.role) {
        sessionStorage.setItem('role', decoded.role);
      }
      sessionStorage.setItem('user', JSON.stringify(loggedInUser));

      console.log("Logged in user:", loggedInUser);
      
      if (loggedInUser.userRoles[0] == "ROLE_CUSTOMER") {
        navigate('/UserDashBoard');
      } else if (loggedInUser.userRoles[0] == "ROLE_OWNER") {
        const paymentSettings = await api.get('/owner/payment-settings');
        navigate(isOwnerPaymentSetupComplete(paymentSettings.data) ? '/OwnerDashBoard' : '/owner/payment-settings');
      } else {
        console.log('Unrecognized user role.');
      }
    } catch (error) {
      setError('Login failed. Please check your email and password.');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-rose-500 via-rose-500 to-orange-500 p-12 flex-col justify-between relative overflow-hidden">
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
            Welcome Back
          </h1>
          <p className="text-white/90 text-lg leading-relaxed">
            Access your account securely and continue managing parking with ease.
          </p>

          {/* Features */}
          <div className="mt-8 space-y-4">
            {['Find parking spots instantly', 'Secure & fast bookings', 'Manage reservations easily'].map((feature, index) => (
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

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
              V
            </div>
            <span className="text-lg font-bold text-slate-900">Valley 360</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="mt-2 text-slate-600">
              Enter your credentials to access your dashboard
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
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={user.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                placeholder="you@example.com"
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
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-rose-500 hover:text-rose-600">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-rose-600 hover:to-orange-600 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              Sign In
            </button>

            <p className="text-center text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link to="/SignUp" className="font-semibold text-rose-500 hover:text-rose-600">
                Create account
              </Link>
            </p>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-50 text-slate-500">Or</span>
              </div>
            </div>

            <Link
              to="/LoginAdmin"
              className="w-full py-2.5 px-4 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin Login
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;



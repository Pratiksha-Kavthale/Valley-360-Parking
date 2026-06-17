import React, { useEffect, useState } from 'react';
import api from '/src/api';
import { toast } from 'react-toastify';
import Navbar from '../Navbar';
import NavbarUser from './NavbarUser';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(null); // User state
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userStr = sessionStorage.getItem('user'); // Fetch user from sessionStorage
      console.log('User fetched from sessionStorage:', userStr); // Debugging

      if (userStr) {
        try {
          const user = JSON.parse(userStr); // Parse user data
          const id = user.id; // Extract user ID
          console.log('User ID:', id); // Debugging
          
          const token = localStorage.getItem('token'); // Fetch JWT token
          console.log('JWT Token:', token); // Debugging
          if (!token) {
            toast.error('Authentication token not found. Please log in again.');
            console.log('JWT token was not found in localStorage.');
            setLoading(false);
            return;
          }

          if (id) {
            const response = await api.get(`http://localhost:8080/User/${id}`);
            console.log('User data fetched from API:', response.data); // Debugging
            setUser(response.data);
          } else {
            toast.error('User ID not found.');
            console.log('User ID not available.');
          }
        } catch (error) {
          toast.error('Error fetching user profile');
          console.error('Error fetching user profile:', error);
        } finally {
          setLoading(false);
        }
      } else {
        toast.error('User not found in session');
        console.log('User was not found in sessionStorage.');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-600">
        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading profile...
      </div>
    </div>
  );

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
  const initials = fullName
    ? fullName
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarUser />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-slate-600 mt-1">Manage your account information</p>
        </div>

        {user ? (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Profile Header with Gradient */}
              <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-8">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                    {initials}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{fullName || 'User'}</h2>
                    <p className="text-white/90 mt-1">{user.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                      Customer
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">First Name</p>
                    <p className="text-base text-slate-900 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-100">{user.firstName || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">Last Name</p>
                    <p className="text-base text-slate-900 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-100">{user.lastName || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">Email Address</p>
                    <p className="text-base text-slate-900 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-100 break-all">{user.email || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">Phone Number</p>
                    <p className="text-base text-slate-900 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-100">{user.contact || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">Address</p>
                    <p className="text-base text-slate-900 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-100">{user.address || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">Gender</p>
                    <p className="text-base text-slate-900 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-100">{user.gender || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Link
                to="/UserDashBoard"
                className="px-5 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg text-center hover:bg-slate-100 transition-colors"
              >
                Back to Dashboard
              </Link>
              <Link
                to="/Update"
                className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium rounded-lg text-center hover:from-rose-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-slate-900 font-medium">No profile data found</p>
            <p className="text-slate-500 mt-1">Please log in again to view your profile</p>
            <Link to="/Login" className="mt-4 inline-block px-5 py-2.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">
              Go to Login
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;



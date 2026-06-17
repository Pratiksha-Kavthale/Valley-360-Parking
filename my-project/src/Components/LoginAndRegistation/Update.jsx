import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '/src/api';
import NavbarUser from '../UserDashBoard/NavbarUser';

const ProfileComponent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    contact: '',
    gender: '',
    address: '',
    role: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const response = await api.get(`http://localhost:8080/User/${user.id}`);
          setFormData((prev) => ({ ...prev, ...response.data }));
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');

    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.contact) newErrors.contact = 'Contact is required';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await api.put(`http://localhost:8080/User/${formData.id}`, formData);
        setSuccess('Profile updated successfully!');
        setTimeout(() => navigate('/Profile'), 1500);
      } catch (error) {
        console.error('Error updating profile:', error);
        setErrors({ submit: 'Failed to update profile. Please try again.' });
      }
    }
    setSaving(false);
  };

  if (loading) {
    return (
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
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarUser />

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/Profile" className="text-sm text-slate-500 hover:text-rose-500 flex items-center gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Profile
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
          <p className="text-slate-600 mt-1">Update your personal information</p>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-5">
            <h2 className="text-lg font-semibold text-white">Personal Information</h2>
            <p className="text-white/80 text-sm mt-1">Make changes to your profile details below</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                  placeholder="John"
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1.5">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                  placeholder="Doe"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1.5">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors bg-slate-50"
                placeholder="you@example.com"
                disabled
              />
              <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number *</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                pattern="[0-9]{10}"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                placeholder="9876543210"
              />
              {errors.contact && <p className="text-red-500 text-xs mt-1.5">{errors.contact}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors"
                placeholder="Your full address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors appearance-none bg-white"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
              <Link
                to="/Profile"
                className="px-5 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg text-center hover:bg-slate-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium rounded-lg text-center hover:from-rose-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfileComponent;



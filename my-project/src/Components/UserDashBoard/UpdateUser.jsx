import api from '/src/api';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const UpdateUserPage = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = sessionStorage.getItem('user');
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Fetch full user details from API
        try {
          const response = await api.get(`http://localhost:8080/User/${parsedUser.id}`);
          const userData = response.data;
          // Pre-populate form with existing data
          setFirstName(userData.firstName || '');
          setLastName(userData.lastName || '');
          setContact(userData.contact || '');
          setAddress(userData.address || '');
        } catch (error) {
          console.error('Error fetching user details:', error);
          // Use session data as fallback
          setFirstName(parsedUser.firstName || '');
          setLastName(parsedUser.lastName || '');
          setContact(parsedUser.contact || '');
          setAddress(parsedUser.address || '');
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Please log in to update your profile.</p>
          <Link to="/Login" className="mt-4 inline-block px-5 py-2 bg-rose-500 text-white rounded-lg">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`http://localhost:8080/User/updateUser/${user.email}`, {
        firstName,
        lastName,
        contact,
        address,
      });
      
      // Update session storage with new data
      const updatedUser = { ...user, firstName, lastName, contact, address };
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully!');
      setTimeout(() => navigate('/Profile'), 1500);
    } catch (error) {
      toast.error('Error updating profile');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <ToastContainer position="top-center" />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Update Profile</h1>
          <p className="text-slate-600 mt-1">Edit your account information</p>
        </div>

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
                  <h2 className="text-2xl font-bold text-white">{fullName}</h2>
                  <p className="text-white/90 mt-1">{user.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
                    Customer
                  </span>
                </div>
              </div>
            </div>

            {/* Update Form */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Edit Information</h3>
              <form onSubmit={handleUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">First Name</label>
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      className="w-full text-slate-800 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Last Name</label>
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      className="w-full text-slate-800 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                    <input 
                      type="tel" 
                      value={contact} 
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full text-slate-800 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Address</label>
                    <input 
                      type="text" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter address"
                      className="w-full text-slate-800 px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                  </div>
                </div>

                {/* Email - Read Only */}
                <div className="mt-6 space-y-1">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <p className="text-slate-500 text-xs">Email cannot be changed</p>
                  <input 
                    type="email" 
                    value={user.email || ''}
                    disabled
                    className="w-full text-slate-500 px-4 py-2.5 bg-slate-100 rounded-lg border border-slate-200 cursor-not-allowed"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                  <Link
                    to="/Profile"
                    className="px-5 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg text-center hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium rounded-lg text-center hover:from-rose-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default UpdateUserPage;


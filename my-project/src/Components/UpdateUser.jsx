import api from '/src/api';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UpdateUserPage = () => {
  const { email } = useParams();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [user, setUser] = useState('');
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    contact: '',
  });

  // Fetch the existing user details to pre-fill the form
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFirstName(parsedUser.firstName || '');
      setLastName(parsedUser.lastName || '');
      setContact(parsedUser.contact || '');
      setAddress(parsedUser.address || '');
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    const contactRegex = /^\d{10}$/;

    if (firstName === lastName) {
      errors.firstName = 'First name and last name must not be the same.';
    }

    if (!contactRegex.test(contact)) {
      errors.contact = 'Contact number must be exactly 10 digits.';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await api.put(`http://localhost:8080/User/updateUser/${user.email}`, {
        firstName,
        lastName,
        contact,
        address,
      });
      toast.success('User details updated successfully!');
    } catch (error) {
      toast.error('Error updating user details');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 flex items-center justify-center px-4 py-8">
      <ToastContainer position="top-center" />
      <h1 className="text-3xl font-bold mb-8 text-center text-slate-900">Update User Details</h1>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-200 shadow-md p-8 w-full max-w-4xl mx-auto">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col">
              <label className="text-sm text-slate-600">First Name:</label>
              <input 
                type="text" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                required
                className={`mt-1 w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 ${errors.firstName ? 'border-red-500' : ''}`}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-slate-600">Last Name:</label>
              <input 
                type="text" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                required
                className={`mt-1 w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 ${errors.firstName ? 'border-red-500' : ''}`} // Use same class for border if error present
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-slate-600">Contact:</label>
              <input 
                type="tel" 
                value={contact} 
                onChange={(e) => setContact(e.target.value)} 
                required
                className={`mt-1 w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 ${errors.contact ? 'border-red-500' : ''}`}
              />
              {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-slate-600">Address:</label>
              <input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                required
                className="mt-1 w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-md py-2 hover:scale-105 hover:shadow-md transition"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUserPage;



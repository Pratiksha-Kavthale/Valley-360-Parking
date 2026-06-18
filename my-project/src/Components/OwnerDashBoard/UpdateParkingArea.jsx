import { useState, useEffect } from 'react';
import api from '/src/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateParkingArea = () => {
  const { id } = useParams(); // Get the parking area ID from the URL
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [status, setStatus] = useState('ACTIVE'); // Default status

  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          toast.error('Error getting location: ' + error.message);
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  }, []);

  useEffect(() => {
    // Fetch parking area details by ID
    const fetchParkingArea = async () => {
      try {
        const response = await api.get(`https://spirited-essence-production.up.railway.app/parkingArea/${id}`);
        const { data } = response;
        setArea(data.area);
        setCity(data.city);
        setPincode(data.pincode);
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setStatus(data.status);
      } catch (error) {
        toast.error('Error fetching parking area details');
        console.error(error);
      }
    };

    fetchParkingArea();
  }, [id]);

  const handleUpdateParkingArea = async (e) => {
    e.preventDefault();
    const owner = JSON.parse(sessionStorage.getItem('user'));

    if (!owner || !owner.id) {
      toast.error('Owner not found in session. Please log in again.');
      return;
    }

    try {
      const response = await api.put(`https://spirited-essence-production.up.railway.app/parkingArea/update/${id}`, {
        area,
        city,
        pincode,
        latitude,
        longitude,
        status,
        ownerId: owner.id // Send owner ID if needed
      });

      if (response.status === 200) {
        toast.success('Parking area updated successfully!');
        navigate('/dashboard'); // Navigate to dashboard or relevant page
      }
    } catch (error) {
      toast.error('Error updating parking area');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 flex items-center justify-center px-4 py-8">
      <ToastContainer position="top-center" />
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-200 shadow-md p-8 w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-rose-400 to-orange-300 text-white flex flex-col justify-center items-center text-center p-6">
          <h1 className="text-3xl font-bold">Update Parking Area</h1>
          <p className="mt-3 text-sm sm:text-base text-white/90">Edit and maintain parking location details efficiently</p>
        </div>
        <div className="w-full md:w-1/2 p-6">
        <form onSubmit={handleUpdateParkingArea} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Area:</label>
              <input 
                type="text" 
                value={area} 
                onChange={(e) => setArea(e.target.value)} 
                className="w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400" 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-slate-600">City:</label>
              <input 
                type="text" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                className="w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400" 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Pincode:</label>
              <input 
                type="text" 
                value={pincode} 
                onChange={(e) => setPincode(e.target.value)} 
                className="w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400" 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Latitude:</label>
              <input 
                type="text" 
                value={latitude} 
                onChange={(e) => setLatitude(e.target.value)} 
                className="w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400" 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Longitude:</label>
              <input 
                type="text" 
                value={longitude} 
                onChange={(e) => setLongitude(e.target.value)} 
                className="w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400" 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Status:</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                className="w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="pt-2">
            <button 
              type="submit" 
              className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-md py-2 hover:scale-105 hover:shadow-md transition"
            >
              Update Parking Area
            </button>
            </div>
          
        </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateParkingArea;



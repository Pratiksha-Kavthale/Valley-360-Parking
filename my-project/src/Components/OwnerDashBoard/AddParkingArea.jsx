import { useState, useEffect } from 'react';
import api from '/src/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const AddParkingArea = () => {
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [status, setStatus] = useState('AVAILABLE'); // Default status
  const [pincodeError, setPincodeError] = useState(''); // For pincode validation

  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/owner-dashboard');
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          // Optionally, you can fetch address based on coordinates here
        },
        (error) => {
          toast.error('Error getting location: ' + error.message);
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  }, []);

  const validatePincode = (pin) => /^\d{6}$/.test(pin);

  const handleAddParkingArea = async (e) => {
    e.preventDefault();

    // Validate pincode
    if (!validatePincode(pincode)) {
      setPincodeError('Pincode must be exactly 6 digits.');
      return;
    } else {
      setPincodeError('');
    }

    const owner = JSON.parse(sessionStorage.getItem('user'));
    const ownerId = owner?.id;
    if (!owner || !ownerId) {
      toast.error('Owner not found in session. Please log in again.');
      return;
    }
    const token = localStorage.getItem('token');
    console.log('TOKEN:', token);
    if(!token){
      toast.error('Authentication token not found. Please log in again.');
      return;
    }



    try {
      const response = await api.post('http://localhost:8080/parkingArea/add', {
        area,
        city,
        pincode,
        latitude,
        longitude,
        status,
        ownerId,
        }
      );
      
      if (response.status === 200) {
        
        const parkArea = response.data;
        
        // Store the parking area details in session storage
        sessionStorage.setItem('parkingArea', JSON.stringify(parkArea));

        toast.success('Parking area added successfully!');
        // Pass the areaId to AddParkingSlot so it can associate the slot with this area
        navigate('/AddParkingSlot', { state: { areaId: parkArea.id } }); 
      }
    } catch (error) {
      toast.error('Error adding parking area');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 flex items-center justify-center px-4 py-8">
      <ToastContainer position="top-center" />
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-200 shadow-md p-8 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-rose-400 to-orange-300 text-white flex flex-col justify-center items-center text-center px-8 py-12">
          <p className='text-sm uppercase tracking-[0.35em] text-white/80'>Valley 360 Parking</p>
          <h1 className='mt-4 text-4xl font-bold leading-tight'>Add Parking Area</h1>
          <p className='mt-4 text-sm sm:text-base text-white/90'>Manage and register parking locations efficiently</p>
        </div>

        <div className="w-full md:w-1/2 px-4 py-8 sm:px-8 lg:px-10">
          <div className="mb-4">
            <button
              onClick={handleBack}
              className="text-sm text-rose-600 hover:text-rose-500 mb-4"
            >
              ← Back
            </button>
          </div>

          <h2 className="text-2xl font-semibold text-slate-900">Parking Area Details</h2>
          <p className="mt-2 text-sm text-slate-600">Enter the location details to register a new parking area</p>

          <form onSubmit={handleAddParkingArea} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Area:</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full text-black border border-rose-200 rounded-md px-3 py-2 outline-none focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-600">City:</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-black border border-rose-200 rounded-md px-3 py-2 outline-none focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Pincode:</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className={`w-full border text-black rounded-md px-3 py-2 outline-none focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 ${pincodeError ? 'border-red-500' : 'border-rose-200'}`}
                required
              />
              {pincodeError && <p className="text-red-500 text-sm mt-1">{pincodeError}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Latitude:</label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full border text-black border-rose-200 rounded-md px-3 py-2 outline-none focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Longitude:</label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full border text-black border-rose-200 rounded-md px-3 py-2 outline-none focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
                readOnly
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-slate-600">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border text-black border-rose-200 rounded-md px-3 py-2 outline-none focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
              >
                <option value="AVAILABLE ">AVAILABLE</option>
                <option value="NOT_AVAILABLE">NOT_AVAILABLE</option>
              </select>
            </div>

            <div className='pt-2'>
              <button
                type="submit"
                className="w-full rounded-md py-2 bg-rose-500 hover:bg-rose-600 text-white shadow-md transition hover:scale-105 hover:shadow-md"
              >
                Add Parking Area
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddParkingArea;



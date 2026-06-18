import { useEffect, useState } from 'react';
import api from '/src/api';
import { useParams, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const ParkingSlots = () => {
  const navigate = useNavigate();
  const { parkingId } = useParams(); // Get parkingId from URL
  const [slots, setSlots] = useState([]);
  const [user, setUser] = useState(null); // Initialize user state

  useEffect(() => {
    // Retrieve the user object from sessionStorage
    const storedUser = sessionStorage.getItem('user');
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await api.get(`https://spirited-essence-production.up.railway.app/parkingSlots/${parkingId}`);
        setSlots(response.data);
      } catch (error) {
        
        console.error('Error fetching parking slots:', error);
      }
    };

    if (parkingId) {
      fetchSlots();
    }
  }, [parkingId]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleBookNow = (Slotid,userid) => {
    navigate(`/Book/${Slotid}/${userid}`); // Navigate to booking page with Slot ID
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 p-6">
      <ToastContainer position="top-center" />
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-slate-900">Parking Slots</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slots.length > 0 ? (
            slots.map((slot, index) => (
              <div key={`${slot.id}-${index}`} className="bg-white text-black rounded-xl p-4 shadow-lg border border-rose-100">
                <h2 className="text-2xl font-bold">Slot Number: {slot.number}</h2>
                <p>Vehicle Type: {slot.vehicleType}</p>
                <p>Status: {slot.status}</p>
                <p>Price: {slot.price ? `$${slot.price.toFixed(2)}` : 'N/A'}</p>
                <button
                  className="mt-4 w-full bg-rose-500 hover:bg-rose-600 text-white rounded-md py-2 hover:scale-105 hover:shadow-md transition"
                  onClick={() => handleBookNow(slot.id, user.id)} // Ensure parkingId is available in the context
                >
                  View Slots
                </button>
              </div>
            ))
          ) : (
            <p className="text-slate-600">No slots available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParkingSlots;



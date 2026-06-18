import { useEffect, useState } from 'react';
import api from '/src/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [parkingAreas, setParkingAreas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchParkingAreas = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            try {
              const response = await api.get('https://spirited-essence-production.up.railway.app/parkingArea/nearby', {
                params: {
                  latitude,
                  longitude,
                   // Assuming 3 km radius
                },
              });
              
              setParkingAreas(response.data);
              alert(response)
            } catch (error) {
              toast.error('Error fetching nearby parking areas');
              console.error('Error fetching nearby parking areas:', error);
            }
          },
          (error) => {
            toast.error('Error fetching location');
            console.error('Error fetching location:', error);
          }
        );
      } else {
        toast.error('Geolocation is not supported by this browser');
      }
    };

    fetchParkingAreas();
  }, []);

  const handleBookNow = (id) => {
    navigate(`/ViewSlots/${id}`); // Navigate to booking page with parking ID
  };

  return (
    <div>
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 text-slate-800 p-6">
      <ToastContainer position="top-center" />
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold mb-6">User Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parkingAreas.length > 0 ? (
            parkingAreas.map((area) => (
              <div key={area.id} className="bg-white text-black rounded-xl p-4 shadow-lg border border-rose-100">
                <h2 className="text-2xl font-bold">{area.city}</h2>
                <p>Status: {area.status}</p>
                <p>PinCode: {area.pincode}</p>
                <p>Area: {area.area}</p>
                <p>Distance: {area.distance ? area.distance.toFixed(2) : 'N/A'} km</p>
                <button
                  className="mt-4 w-full bg-rose-500 hover:bg-rose-600 text-white rounded-md py-2 hover:scale-105 hover:shadow-md transition"
                  onClick={() => handleBookNow(area.id)}
                >
                  View Slots
                </button>
              </div>
            ))
          ) : (
            <p className="text-slate-600">No parking areas found.</p>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default UserDashboard;



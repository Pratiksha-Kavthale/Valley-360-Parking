import React, { useEffect, useState } from 'react';
import api from '/src/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ParkingReviews from './ParkingReviews';
import NavbarUser from './NavbarUser';

const ParkingSlots = () => {
  const navigate = useNavigate();
  const { parkingId } = useParams();
  const [slots, setSlots] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('User is not authenticated. Please log in.');
          return;
        }
        const response = await api.get(`http://localhost:8080/parkingSlots/${parkingId}`);
        setSlots(response.data);
      } catch (error) {
        toast.error('Error fetching parking slots');
        console.error('Error fetching parking slots:', error);
      } finally {
        setLoading(false);
      }
    };

    if (parkingId) {
      fetchSlots();
    }
  }, [parkingId]);

  if (!user) {
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

  const handleBookNow = (slotId) => {
    navigate(`/Book/${slotId}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'occupied': return 'bg-red-100 text-red-700';
      case 'reserved': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarUser />
      <ToastContainer position="top-center" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/UserDashBoard" className="text-sm text-slate-500 hover:text-rose-500 flex items-center gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-rose-100 p-2.5 text-rose-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Available Parking Slots</h1>
              <p className="text-slate-600">Select a slot to book your parking</p>
            </div>
          </div>
        </div>

        {/* Slots Grid */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 mb-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : slots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.map((slot) => (
                <div key={slot.id} className="rounded-xl border border-slate-200 bg-white p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">Slot #{slot.number}</h3>
                        <p className="text-sm text-slate-500">{slot.vehicleType}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(slot.status)}`}>
                      {slot.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-sm text-slate-500">Price per hour</p>
                      <p className="text-lg font-bold text-slate-900">${slot.price?.toFixed(2) || 'N/A'}</p>
                    </div>
                    <button
                      className="px-4 py-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium rounded-lg hover:from-rose-600 hover:to-orange-600 transition-all shadow-sm hover:shadow-md text-sm disabled:opacity-50"
                      onClick={() => handleBookNow(slot.id)}
                      disabled={slot.status?.toLowerCase() !== 'available'}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-slate-900 font-medium">No parking slots available</p>
              <p className="text-slate-500 text-sm mt-1">Please check back later or try a different parking area</p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <ParkingReviews parkingId={parkingId} />
      </main>
    </div>
  );
};

export default ParkingSlots;



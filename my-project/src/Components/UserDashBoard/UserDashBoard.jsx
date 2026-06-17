import React, { useEffect, useState } from 'react';
import api from '/src/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import {
  LuMapPinned,
  LuCalendarDays,
  LuCircleDollarSign,
  LuUsers,
  LuClock3,
  LuEye,
  LuCarFront,
  LuRefreshCw,
  LuPin,
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer/Footer';
import ParkingMap from './ParkingMap';
import { FadeRight, FadeUp } from '../../utility/annimation';

const UserDashboard = () => {
  const [parkingAreas, setParkingAreas] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [user, setUser] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  const fetchParkingAreas = async () => {
    setLocationError('');
    if (!navigator.geolocation) {
      const message = 'Location access required to find nearby parking';
      toast.error(message);
      setLocationError(message);
      setUserLocation({ lat: 6.9271, lng: 79.8612 });
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('User is not authenticated. Please log in.');
          setLoadingLocation(false);
          return;
        }

        try {
          const response = await api.get('/parkingArea/nearby', {
            params: {
              latitude,
              longitude,
              radius: 3,
            },
          });

          setParkingAreas(response.data);
        } catch (error) {
          toast.error('Error fetching nearby parking areas');
          console.error('Error fetching nearby parking areas:', error);
        } finally {
          setLoadingLocation(false);
        }
      },
      (error) => {
        const message = 'Location access required to find nearby parking';
        toast.error(message);
        setLocationError(message);
        setUserLocation({ lat: 6.9271, lng: 79.8612 });
        console.error('Error fetching location:', error);
        setLoadingLocation(false);
      }
    );
  };

  useEffect(() => {
    fetchParkingAreas();
  }, []);

  const handleBookNow = (id) => {
    navigate(`/ViewSlots/${id}`);
  };

  const handleRefresh = () => {
    setLoadingLocation(true);
    fetchParkingAreas();
  };

  const activeAreas = parkingAreas.filter((area) => String(area.status).toUpperCase() === 'ACTIVE').length;
  const estimatedTotal = parkingAreas.reduce((sum, area) => sum + Number(area.price || 0), 0);

  const stats = [
    {
      label: 'Nearby areas',
      value: parkingAreas.length,
      icon: LuMapPinned,
    },
    {
      label: 'Active areas',
      value: activeAreas,
      icon: LuCalendarDays,
    },
    {
      label: 'Search radius',
      value: '3 km',
      icon: LuCircleDollarSign,
    },
    {
      label: 'User ID',
      value: user?.id ?? 'N/A',
      icon: LuUsers,
    },
  ];

  const parkingCard = (area, index) => (
    <motion.article
      key={area.id}
      variants={FadeUp(0.15 + index * 0.05)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-rose-50 p-2.5 text-rose-500">
            <LuPin className="text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{area.city}</h3>
            <p className="text-sm text-slate-500">{area.area}</p>
          </div>
        </div>
        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
          {area.status}
        </span>
      </div>

      <div className="mt-4 space-y-1.5 text-sm">
        <p className="text-slate-600"><span className="text-slate-400">PinCode:</span> {area.pincode}</p>
        <p className="text-slate-600"><span className="text-slate-400">Distance:</span> {area.distance ? area.distance.toFixed(2) : 'N/A'} km</p>
      </div>

      <button
        className="mt-4 w-full primary-btn inline-flex items-center justify-center gap-2 text-sm py-2.5"
        onClick={() => handleBookNow(area.id)}
      >
        <LuCarFront className="text-base" />
        View Slots
      </button>
    </motion.article>
  );

  return (
    <main className="min-h-screen bg-slate-50 overflow-x-hidden">

      <section className="py-8 sm:py-12">
        <div className="container mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={FadeRight(0.2)}
            initial="hidden"
            animate="visible"
            className="rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 p-6 shadow-lg sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-white sm:text-3xl">Welcome back, find and book parking with clarity.</h1>
                <p className="max-w-2xl text-white/90">
                  Search nearby parking areas, view available slots, and manage your account from one consistent interface.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-white/20 backdrop-blur-sm p-4">
                <div className="rounded-lg bg-white/30 p-2.5 text-white">
                  <LuUsers className="text-xl" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Logged in as</p>
                  <p className="text-base font-semibold text-white">{user?.firstName || user?.email || 'Customer'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <ToastContainer position="top-center" />

          <section className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-rose-100 p-2.5 text-rose-500">
                <LuEye className="text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Overview</h2>
                <p className="text-sm text-slate-500">A quick summary of your parking search context.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <motion.div
                    key={stat.label}
                    variants={FadeUp(0.2 + index * 0.08)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="rounded-lg bg-rose-50 p-2.5 text-rose-500">
                        <Icon className="text-lg" />
                      </div>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-rose-100 p-2.5 text-rose-500">
                <LuClock3 className="text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
                <p className="text-sm text-slate-500">Move through the common user flows quickly.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-lg font-semibold text-slate-900">View Nearby Slots</p>
                <p className="text-sm text-slate-500 mt-2">Browse nearby parking areas and open the slots view for booking.</p>
                <button className="mt-4 primary-btn inline-flex items-center gap-2 text-sm" onClick={handleRefresh}>
                  <LuRefreshCw className="text-base" />
                  Refresh Results
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-lg font-semibold text-slate-900">Update Profile</p>
                <p className="text-sm text-slate-500 mt-2">Keep your contact details and account information current.</p>
                <button
                  className="mt-4 border border-slate-200 bg-white px-4 py-2 rounded-lg text-sm font-medium text-slate-700 transition hover:border-rose-500 hover:text-rose-500"
                  onClick={() => navigate('/Update')}
                >
                  Update Profile
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-lg font-semibold text-slate-900">My Profile</p>
                <p className="text-sm text-slate-500 mt-2">View your account information in a consistent dashboard style.</p>
                <button
                  className="mt-4 border border-slate-200 bg-white px-4 py-2 rounded-lg text-sm font-medium text-slate-700 transition hover:border-rose-500 hover:text-rose-500"
                  onClick={() => navigate('/Profile')}
                >
                  Open Profile
                </button>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-lg bg-rose-100 p-2.5 text-rose-500">
                <LuMapPinned className="text-lg" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Nearby Parking Areas</h2>
                <p className="text-sm text-slate-500">Find and book parking spots near your location.</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Parking Near You</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {loadingLocation
                      ? 'Locating nearby parking areas...'
                      : locationError || `Showing parking areas within 3km radius.`}
                  </p>
                </div>
                <button
                  className="border border-slate-200 bg-white px-4 py-2 rounded-lg text-sm font-medium text-slate-700 transition hover:border-rose-500 hover:text-rose-500"
                  onClick={handleRefresh}
                >
                  Refresh
                </button>
              </div>

              <div className="mt-5">
                <ParkingMap
                  parkingAreas={parkingAreas}
                  userLocation={userLocation}
                  loading={loadingLocation}
                  locationError={locationError}
                  onBookNow={handleBookNow}
                />
              </div>

              {parkingAreas.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {parkingAreas.map((area, index) => parkingCard(area, index))}
                </div>
              ) : (
                <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-5 text-center">
                  <p className="text-slate-500">No parking areas found nearby. Try refreshing or adjusting your location.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default UserDashboard;
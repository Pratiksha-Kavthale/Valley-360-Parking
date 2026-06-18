import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import {
  LuMapPinned,
  LuCalendarDays,
  LuCarFront,
  LuRefreshCw,
  LuNavigation,
  LuHistory,
  LuMapPin,
  LuCar,
} from 'react-icons/lu';
import {
  HiOutlineFilter,
  HiOutlineSearch,
  HiOutlineStar,
  HiOutlineChevronRight,
  HiOutlineShieldCheck,
  HiOutlineCash,
} from 'react-icons/hi';
import api from '/src/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../ui/Sidebar';
import { Skeleton, EmptyState, GlassCard } from '../ui/LoadingStates';
import ParkingMap from './ParkingMap';
import Footer from '../Footer/Footer';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color = 'rose', loading }) => {
  const colors = {
    rose: 'from-rose-500 to-rose-600',
    orange: 'from-orange-500 to-orange-600',
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-6 w-12" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2, boxShadow: '0 10px 30px -12px rgba(0,0,0,0.15)' }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 transition-all"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className="text-xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </motion.div>
  );
};

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
  loading: PropTypes.bool,
};

// Parking Area Card Component
const ParkingAreaCard = ({ area, onBook, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
        <Skeleton className="h-32 w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Calculate available slots
  const totalSlots = area.totalSlots || area.slots?.length || 0;
  const availableSlots = area.availableSlots ?? area.slots?.filter(s => s.status === 'AVAILABLE')?.length ?? totalSlots;
  const isFull = totalSlots > 0 && availableSlots === 0;

  // Derive effective status — override to NOT_AVAILABLE when all slots are booked
  const effectiveStatus = isFull ? 'NOT_AVAILABLE' : (area.status || 'ACTIVE');

  const statusColors = {
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    NOT_AVAILABLE: 'bg-red-100 text-red-700',
    INACTIVE: 'bg-red-100 text-red-700',
    MAINTENANCE: 'bg-amber-100 text-amber-700',
  };
  const statusLabel = {
    ACTIVE: 'Active',
    NOT_AVAILABLE: 'Not Available',
    INACTIVE: 'Inactive',
    MAINTENANCE: 'Maintenance',
  };

  // Price display logic
  const priceMin = area.priceMin || area.price || 0;
  const priceMax = area.priceMax || area.price || 0;
  const priceDisplay = priceMin === priceMax 
    ? `₹${priceMin}/hr` 
    : `₹${priceMin}-${priceMax}/hr`;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)' }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 transition-all group"
    >
      {/* Image/Map Preview */}
      <div className="h-32 bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <LuCar className="w-16 h-16 text-rose-300" />
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[effectiveStatus] || statusColors.ACTIVE}`}>
            {statusLabel[effectiveStatus] || effectiveStatus}
          </span>
        </div>
        {area.distance !== undefined && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-slate-700">
            <LuNavigation className="w-3 h-3" />
            {typeof area.distance === 'number' ? area.distance.toFixed(1) : area.distance} km
          </div>
        )}
        {totalSlots > 0 && (
          <div className={`absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 backdrop-blur-sm rounded-full text-xs font-medium text-white ${isFull ? 'bg-red-500/90' : 'bg-emerald-500/90'}`}>
            <LuCar className="w-3 h-3" />
            {isFull ? 'Full' : `${availableSlots}/${totalSlots} slots`}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-slate-800 mb-1 line-clamp-1">{area.area}</h3>
        <p className="text-sm text-slate-500 flex items-center gap-1 mb-3">
          <LuMapPin className="w-4 h-4" />
          {area.city}, {area.pincode}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <HiOutlineStar
                key={i}
                className={`w-4 h-4 ${i < (area.rating || 4) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
              />
            ))}
            <span className="text-xs text-slate-500 ml-1">({area.reviews || 0})</span>
          </div>
          <span className="text-sm font-semibold text-rose-600">{priceDisplay}</span>
        </div>

        <motion.button
          whileHover={isFull ? {} : { scale: 1.02 }}
          whileTap={isFull ? {} : { scale: 0.98 }}
          onClick={() => !isFull && onBook(area.id)}
          disabled={isFull}
          className={`w-full py-2.5 font-medium rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
            isFull
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-rose-200 hover:shadow-xl'
          }`}
        >
          {isFull ? 'No Slots Available' : 'View Slots'}
          {!isFull && <HiOutlineChevronRight className="w-4 h-4" />}
        </motion.button>
      </div>
    </motion.div>
  );
};

ParkingAreaCard.propTypes = {
  area: PropTypes.shape({
    id: PropTypes.number,
    area: PropTypes.string,
    city: PropTypes.string,
    pincode: PropTypes.string,
    status: PropTypes.string,
    rating: PropTypes.number,
    reviews: PropTypes.number,
    distance: PropTypes.number,
    totalSlots: PropTypes.number,
    availableSlots: PropTypes.number,
    priceMin: PropTypes.number,
    priceMax: PropTypes.number,
    price: PropTypes.number,
    slots: PropTypes.array,
  }),
  onBook: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

const UserDashboardEnhanced = () => {
  const navigate = useNavigate();
  const [parkingAreas, setParkingAreas] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [radiusKm, setRadiusKm] = useState(5); // Distance filter in km
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fetchParkingAreas = useCallback(async () => {
    setLocationError('');
    setLoading(true);

    if (!navigator.geolocation) {
      const message = 'Location access required to find nearby parking';
      toast.error(message);
      setLocationError(message);
      setUserLocation({ lat: 6.9271, lng: 79.8612 });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        try {
          const response = await api.get('http://localhost:8080/parkingArea/nearby', {
            params: { latitude, longitude, radiusKm },
          });
          setParkingAreas(response.data);
        } catch (error) {
          console.error('Error fetching parking areas:', error);
          toast.error('Error fetching nearby parking areas');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Location error:', error);
        setLocationError('Unable to get your location');
        setUserLocation({ lat: 6.9271, lng: 79.8612 });
        setLoading(false);
      }
    );
  }, [radiusKm]);

  useEffect(() => {
    fetchParkingAreas();
  }, [fetchParkingAreas]);

  // Re-fetch when radius changes (only if we have location)
  useEffect(() => {
    if (userLocation.lat && userLocation.lng) {
      const fetchWithRadius = async () => {
        setLoading(true);
        try {
          const response = await api.get('http://localhost:8080/parkingArea/nearby', {
            params: { latitude: userLocation.lat, longitude: userLocation.lng, radiusKm },
          });
          setParkingAreas(response.data);
        } catch (error) {
          console.error('Error fetching parking areas:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchWithRadius();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radiusKm]);

  const handleBookNow = (id) => {
    navigate(`/ViewSlots/${id}`);
  };

  const handleRefresh = () => {
    fetchParkingAreas();
  };

  // Filter and search
  const filteredAreas = useMemo(() => {
    let result = parkingAreas;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (area) =>
          area.area?.toLowerCase().includes(query) ||
          area.city?.toLowerCase().includes(query) ||
          area.pincode?.toString().includes(query)
      );
    }

    // Price range filter
    if (priceRange.min) {
      result = result.filter((area) => (area.priceMin || area.price || 0) >= Number(priceRange.min));
    }
    if (priceRange.max) {
      result = result.filter((area) => (area.priceMax || area.price || 0) <= Number(priceRange.max));
    }

    return result;
  }, [parkingAreas, searchQuery, priceRange]);

  // Stats
  const stats = useMemo(() => ({
    totalAreas: parkingAreas.length,
    activeAreas: parkingAreas.filter((a) => String(a.status).toUpperCase() === 'ACTIVE').length,
    searchRadius: `${radiusKm} km`,
    avgDistance: parkingAreas.length
      ? (parkingAreas.reduce((sum, a) => sum + (a.distance || 0), 0) / parkingAreas.length).toFixed(1)
      : '0',
  }), [parkingAreas, radiusKm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Sidebar */}
      <Sidebar variant="user" user={user} />

      {/* Main Content */}
      <main className="lg:ml-20 min-h-screen">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
                Welcome{user?.firstName ? `, ${user.firstName}` : ''}! 👋
              </h1>
              <p className="text-slate-500 mt-1">Find and book parking spots near you</p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                <LuRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/user/bookings')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium rounded-xl shadow-lg shadow-rose-200 hover:shadow-xl transition-all"
              >
                <LuHistory className="w-4 h-4" />
                <span className="hidden sm:inline">My Bookings</span>
              </motion.button>
            </div>
          </div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            <StatCard
              icon={LuMapPinned}
              label="Nearby Areas"
              value={stats.totalAreas}
              color="rose"
              loading={loading}
            />
            <StatCard
              icon={LuCar}
              label="Active Areas"
              value={stats.activeAreas}
              color="emerald"
              loading={loading}
            />
            <StatCard
              icon={LuNavigation}
              label="Search Radius"
              value={stats.searchRadius}
              color="blue"
              loading={loading}
            />
            <StatCard
              icon={LuCarFront}
              label="Avg. Distance"
              value={`${stats.avgDistance} km`}
              color="orange"
              loading={loading}
            />
          </motion.div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by area, city, or pincode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
              />
            </div>

            {/* Distance Filter Dropdown */}
            <div className="relative">
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="appearance-none pl-4 pr-10 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer"
              >
                <option value={2}>2 km</option>
                <option value={3}>3 km</option>
                <option value={5}>5 km</option>
                <option value={7}>7 km</option>
                <option value={10}>10 km</option>
              </select>
              <LuNavigation className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`flex items-center gap-2 px-4 py-3 border rounded-xl transition-all ${
                  filterOpen
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <HiOutlineFilter className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
              </button>

              <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-3 transition-all ${
                    viewMode === 'grid' ? 'bg-rose-500 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-3 transition-all ${
                    viewMode === 'map' ? 'bg-rose-500 text-white' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <LuMapPinned className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="p-4 bg-white border border-slate-200 rounded-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Min Price (₹/hr)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="w-full px-3 py-2 text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Max Price (₹/hr)</label>
                      <input
                        type="number"
                        placeholder="100"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="w-full px-3 py-2 text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => setPriceRange({ min: '', max: '' })}
                        className="w-full px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Location Error */}
          {locationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3"
            >
              <LuNavigation className="w-5 h-5 text-amber-600" />
              <p className="text-amber-700 text-sm">{locationError}</p>
            </motion.div>
          )}

          {/* Content */}
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                      <ParkingAreaCard key={i} loading />
                    ))}
                  </div>
                ) : filteredAreas.length > 0 ? (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    {filteredAreas.map((area) => (
                      <ParkingAreaCard key={area.id} area={area} onBook={handleBookNow} />
                    ))}
                  </motion.div>
                ) : (
                  <EmptyState
                    icon={LuCar}
                    title="No parking areas found"
                    description={
                      searchQuery
                        ? "Try adjusting your search or clearing filters"
                        : "No parking areas available in your vicinity. Try refreshing or expanding search radius."
                    }
                    action={handleRefresh}
                    actionLabel="Refresh"
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-[600px] rounded-2xl overflow-hidden shadow-lg border border-slate-200"
              >
                <ParkingMap
                  parkingAreas={filteredAreas}
                  userLocation={userLocation}
                  loading={loading}
                  locationError={locationError}
                  onBookNow={handleBookNow}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <GlassCard className="p-6 cursor-pointer" onClick={() => navigate('/user/bookings')}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                  <LuCalendarDays className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">My Bookings</h3>
                  <p className="text-sm text-slate-500">View booking history</p>
                </div>
                <HiOutlineChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
              </div>
            </GlassCard>

            <GlassCard className="p-6 cursor-pointer" onClick={() => navigate('/Profile')}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <HiOutlineShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Profile</h3>
                  <p className="text-sm text-slate-500">Manage your account</p>
                </div>
                <HiOutlineChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
              </div>
            </GlassCard>

            <GlassCard className="p-6 cursor-pointer" onClick={() => navigate('/Update')}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <HiOutlineCash className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Settings</h3>
                  <p className="text-sm text-slate-500">Update preferences</p>
                </div>
                <HiOutlineChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
              </div>
            </GlassCard>
          </motion.div>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default UserDashboardEnhanced;

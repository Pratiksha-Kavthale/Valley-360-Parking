import { useEffect, useState, useMemo } from 'react';
import api from '/src/api';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineArrowLeft,
  HiOutlineLocationMarker,
  HiOutlineCube,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
} from 'react-icons/hi';
import { LuCar, LuBike, LuTruck, LuLayoutGrid, LuList } from 'react-icons/lu';
import ParkingReviews from './ParkingReviews';

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

const ParkingSlots = () => {
  const navigate = useNavigate();
  const { parkingId } = useParams();
  const [slots, setSlots] = useState([]);
  const [parkingArea, setParkingArea] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('User is not authenticated. Please log in.');
          return;
        }
        
        // Fetch slots
        const slotsResponse = await api.get(`https://spirited-essence-production.up.railway.app/parkingSlots/${parkingId}`);
        setSlots(slotsResponse.data);
        
        // Fetch parking area details
        try {
          const areaResponse = await api.get(`https://spirited-essence-production.up.railway.app/parkingArea/${parkingId}`);
          setParkingArea(areaResponse.data);
        } catch (error) {
          console.log('Could not fetch parking area details');
        }
      } catch (error) {
        toast.error('Error fetching parking slots');
        console.error('Error fetching parking slots:', error);
      } finally {
        setLoading(false);
      }
    };

    if (parkingId) {
      fetchData();
    }
  }, [parkingId]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = slots.length;
    const available = slots.filter(s => s.status?.toUpperCase() === 'AVAILABLE').length;
    const occupied = total - available;
    const minPrice = slots.length > 0 ? Math.min(...slots.map(s => s.price || 0)) : 0;
    const maxPrice = slots.length > 0 ? Math.max(...slots.map(s => s.price || 0)) : 0;
    
    return { total, available, occupied, minPrice, maxPrice };
  }, [slots]);

  // Filter slots
  const filteredSlots = useMemo(() => {
    if (filterType === 'ALL') return slots;
    return slots.filter(s => s.vehicleType?.toUpperCase() === filterType);
  }, [slots, filterType]);

  // Get unique vehicle types
  const vehicleTypes = useMemo(() => {
    const types = [...new Set(slots.map(s => s.vehicleType?.toUpperCase()).filter(Boolean))];
    return types;
  }, [slots]);

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
    switch (status?.toUpperCase()) {
      case 'AVAILABLE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'NOT_AVAILABLE': 
      case 'OCCUPIED': return 'bg-red-100 text-red-700 border-red-200';
      case 'RESERVED': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getVehicleIcon = (type) => {
    switch (type?.toUpperCase()) {
      case 'CAR': return LuCar;
      case 'BIKE':
      case 'MOTORCYCLE': return LuBike;
      case 'TRUCK': return LuTruck;
      default: return LuCar;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <ToastContainer position="top-center" />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link to="/UserDashBoard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-rose-500 transition-colors mb-4">
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <HiOutlineLocationMarker className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {parkingArea?.area || 'Parking Area'}
                  </h1>
                  <p className="text-white/90 flex items-center gap-2 mt-1">
                    <span>{parkingArea?.city || 'City'}</span>
                    {parkingArea?.pincode && <span>• {parkingArea.pincode}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <p className="text-2xl font-bold text-white">{stats.available}</p>
                  <p className="text-xs text-white/80">Available</p>
                </div>
                <div className="text-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl">
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-xs text-white/80">Total Slots</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Available</p>
                <p className="text-xl font-bold text-slate-800">{stats.available}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <HiOutlineXCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Occupied</p>
                <p className="text-xl font-bold text-slate-800">{stats.occupied}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <HiOutlineCube className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Slots</p>
                <p className="text-xl font-bold text-slate-800">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                <HiOutlineClock className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Price Range</p>
                <p className="text-lg font-bold text-slate-800">
                  ₹{stats.minPrice}{stats.minPrice !== stats.maxPrice ? `-${stats.maxPrice}` : ''}/hr
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filter Bar */}
        {vehicleTypes.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === 'ALL'
                  ? 'bg-rose-500 text-white shadow-lg'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Types
            </button>
            {vehicleTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  filterType === type
                    ? 'bg-rose-500 text-white shadow-lg'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {(() => {
                  const Icon = getVehicleIcon(type);
                  return <Icon className="w-4 h-4" />;
                })()}
                {type}
              </button>
            ))}
          </motion.div>
        )}

        {/* View toggle + Legend */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="flex flex-wrap items-center justify-between gap-4 mb-4">
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />Available</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-400 inline-block" />Occupied</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-400 inline-block" />Reserved</span>
          </div>
          {/* Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <button onClick={() => setViewMode('map')} className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'map' ? 'bg-rose-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              <LuLayoutGrid className="w-4 h-4" /> Map View
            </button>
            <button onClick={() => setViewMode('list')} className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-rose-500 text-white' : 'text-slate-600 hover:bg-slate-50'}`}>
              <LuList className="w-4 h-4" /> List View
            </button>
          </div>
        </motion.div>

        {/* Slots Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 mb-8"
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12"
              >
                <svg className="animate-spin w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </motion.div>
            ) : filteredSlots.length > 0 ? (
              viewMode === 'map' ? (
                /* ── Visual Parking Map Grid ── */
                <motion.div key="map-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Drive aisle label */}
                  <div className="text-center mb-4">
                    <span className="inline-block bg-slate-800 text-white text-xs font-semibold px-6 py-1.5 rounded-full tracking-widest uppercase">ENTRANCE / EXIT</span>
                  </div>
                  {/* Road strip */}
                  <div className="h-8 bg-gradient-to-r from-slate-300 via-slate-200 to-slate-300 rounded-lg mb-6 flex items-center justify-center gap-8">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-0.5 w-8 bg-white/70 rounded" />
                    ))}
                  </div>
                  {/* Slot grid — 6 per row with row labels */}
                  {Array.from({ length: Math.ceil(filteredSlots.length / 6) }).map((_, rowIdx) => {
                    const rowSlots = filteredSlots.slice(rowIdx * 6, rowIdx * 6 + 6);
                    const rowLabel = String.fromCharCode(65 + rowIdx); // A, B, C ...
                    return (
                      <div key={rowIdx} className="flex items-center gap-3 mb-4">
                        {/* Row label */}
                        <div className="w-8 flex-shrink-0 text-center">
                          <span className="text-sm font-bold text-slate-400">{rowLabel}</span>
                        </div>
                        {/* Slots */}
                        <div className="flex flex-wrap gap-3">
                          {rowSlots.map((slot) => {
                            const st = slot.status?.toUpperCase();
                            const isAvailable = st === 'AVAILABLE';
                            const isReserved = st === 'RESERVED';
                            const VehicleIcon = getVehicleIcon(slot.vehicleType);

                            const slotColors = isAvailable
                              ? 'bg-emerald-100 border-emerald-400 text-emerald-700 hover:bg-emerald-200 cursor-pointer shadow-emerald-100'
                              : isReserved
                              ? 'bg-amber-100 border-amber-400 text-amber-700 cursor-not-allowed shadow-amber-100'
                              : 'bg-red-100 border-red-400 text-red-700 cursor-not-allowed shadow-red-100';

                            return (
                              <motion.button
                                key={slot.id}
                                whileHover={isAvailable ? { scale: 1.08, y: -2 } : {}}
                                whileTap={isAvailable ? { scale: 0.95 } : {}}
                                onClick={() => isAvailable && handleBookNow(slot.id)}
                                disabled={!isAvailable}
                                title={`Slot #${slot.id} — ${slot.vehicleType || 'Standard'} — ₹${slot.price}/hr — ${slot.status}`}
                                className={`relative w-16 h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all shadow-md ${slotColors}`}
                              >
                                <VehicleIcon className="w-5 h-5" />
                                <span className="text-xs font-bold leading-none">{rowLabel}{(rowIdx * 6) + rowSlots.indexOf(slot) + 1}</span>
                                <span className="text-[9px] font-medium opacity-70 leading-none">₹{slot.price || 0}</span>
                                {isAvailable && (
                                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {/* Tap hint */}
                  <p className="text-center text-xs text-slate-400 mt-4">Tap a <span className="text-emerald-600 font-semibold">green slot</span> to book it instantly</p>
                </motion.div>
              ) : (
                /* ── List View (original card grid) ── */
                <motion.div
                  key="list-view"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {filteredSlots.map((slot) => {
                    const VehicleIcon = getVehicleIcon(slot.vehicleType);
                    const isAvailable = slot.status?.toUpperCase() === 'AVAILABLE';
                    
                    return (
                      <motion.div
                        key={slot.id}
                        variants={itemVariants}
                        whileHover={{ y: -4, boxShadow: '0 12px 30px -8px rgba(0,0,0,0.12)' }}
                        className={`rounded-xl border-2 ${isAvailable ? 'border-slate-200' : 'border-red-100'} bg-white p-5 transition-all`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`rounded-xl p-3 ${isAvailable ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                              <VehicleIcon className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-slate-900">Slot #{slot.id}</h3>
                              <p className="text-sm text-slate-500">{slot.vehicleType || 'Standard'}</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(slot.status)}`}>
                            {slot.status?.replace('_', ' ') || 'Unknown'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Price/Hour</p>
                            <p className="text-2xl font-bold text-rose-600">₹{slot.price?.toFixed(0) || 'N/A'}</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: isAvailable ? 1.05 : 1 }}
                            whileTap={{ scale: isAvailable ? 0.95 : 1 }}
                            onClick={() => handleBookNow(slot.id)}
                            disabled={!isAvailable}
                            className={`px-5 py-2.5 font-medium rounded-xl text-sm transition-all ${
                              isAvailable
                                ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-200 hover:shadow-xl'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {isAvailable ? 'Book Now' : 'Unavailable'}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <LuCar className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-slate-900 font-semibold text-lg">No parking slots found</p>
                <p className="text-slate-500 mt-2">
                  {filterType !== 'ALL' 
                    ? `No ${filterType.toLowerCase()} slots available. Try a different filter.`
                    : 'Please check back later or try a different parking area'}
                </p>
                {filterType !== 'ALL' && (
                  <button
                    onClick={() => setFilterType('ALL')}
                    className="mt-4 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    Show All Slots
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Reviews Section */}
        <ParkingReviews parkingId={parkingId} />
      </main>
    </div>
  );
};

export default ParkingSlots;



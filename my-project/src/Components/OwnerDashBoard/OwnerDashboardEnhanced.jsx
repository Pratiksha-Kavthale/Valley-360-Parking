import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineCurrencyRupee,
  HiOutlineStar,
  HiOutlineCog,
  HiOutlineRefresh,
  HiOutlineChevronRight,
  HiOutlineLocationMarker,
  HiOutlineCreditCard,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';
import { LuCar, LuCalendarDays, LuHistory, LuPlus, LuSquareParking } from 'react-icons/lu';
import api from '/src/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../ui/Sidebar';
import { Skeleton } from '../ui/LoadingStates';
import Footer from '../Footer/Footer';
import PropTypes from 'prop-types';

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

// Chart colors
const COLORS = {
  primary: '#f43f5e',
  secondary: '#f97316',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
};

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, change, changeType, color = 'rose', loading, onClick }) => {
  const colors = {
    rose: 'from-rose-500 to-rose-600',
    orange: 'from-orange-500 to-orange-600',
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, boxShadow: '0 12px 30px -8px rgba(0,0,0,0.12)' }}
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            {change !== undefined && (
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${
                changeType === 'positive' ? 'text-emerald-600' : changeType === 'negative' ? 'text-red-500' : 'text-slate-400'
              }`}>
                {changeType === 'positive' ? <HiOutlineTrendingUp className="w-3 h-3" /> : 
                 changeType === 'negative' ? <HiOutlineTrendingDown className="w-3 h-3" /> : null}
                {change}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  change: PropTypes.string,
  changeType: PropTypes.oneOf(['positive', 'negative', 'neutral']),
  color: PropTypes.string,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
};

// Trust Score Gauge Component
const TrustScoreGauge = ({ score, riskLevel, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-32 w-32 rounded-full mx-auto" />
      </div>
    );
  }

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'LOW': return 'text-emerald-500';
      case 'MEDIUM': return 'text-amber-500';
      case 'HIGH': return 'text-orange-500';
      case 'CRITICAL': return 'text-red-500';
      default: return 'text-emerald-500';
    }
  };

  const getProgressColor = () => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Trust Score</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          riskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-700' :
          riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
          riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' :
          'bg-red-100 text-red-700'
        }`}>
          {riskLevel} Risk
        </span>
      </div>
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="10"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke={getProgressColor()}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getRiskColor()}`}>{score}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
        </div>
      </div>
      <p className="text-center text-sm text-slate-600 mt-4">
        {score >= 80 ? 'Excellent reputation!' : 
         score >= 60 ? 'Good standing' : 
         score >= 40 ? 'Needs improvement' : 'Action required'}
      </p>
    </motion.div>
  );
};

TrustScoreGauge.propTypes = {
  score: PropTypes.number.isRequired,
  riskLevel: PropTypes.string.isRequired,
  loading: PropTypes.bool,
};

// Revenue Chart Component
const RevenueChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Revenue Trend</h3>
        <span className="text-xs text-slate-500">Last 7 days</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `₹${v}`} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            formatter={(value) => [`₹${value.toFixed(2)}`, 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={COLORS.primary}
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

RevenueChart.propTypes = {
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
};

// Booking Stats Chart
const BookingStatsChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Booking Overview</h3>
        <span className="text-xs text-slate-500">Last 7 days</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          />
          <Legend />
          <Bar dataKey="bookings" name="Bookings" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
          <Bar dataKey="completed" name="Completed" fill={COLORS.success} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

BookingStatsChart.propTypes = {
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
};

// Reviews Pie Chart
const ReviewsPieChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-48 w-48 rounded-full mx-auto" />
      </div>
    );
  }

  const totalReviews = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Review Sentiment</h3>
        <span className="text-sm text-slate-500">{totalReviews} reviews</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            formatter={(value, name) => [`${value} (${totalReviews > 0 ? ((value/totalReviews)*100).toFixed(0) : 0}%)`, name]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

ReviewsPieChart.propTypes = {
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
};

// Rating Distribution Chart
const RatingDistribution = ({ data, avgRating, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Rating Distribution</h3>
        <div className="flex items-center gap-1">
          <HiOutlineStar className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="font-bold text-slate-800">{avgRating.toFixed(1)}</span>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.rating} className="flex items-center gap-3">
            <span className="text-sm text-slate-600 w-12">{item.rating} star</span>
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  item.rating >= 4 ? 'bg-emerald-500' :
                  item.rating === 3 ? 'bg-amber-500' : 'bg-red-500'
                }`}
              />
            </div>
            <span className="text-sm text-slate-500 w-12 text-right">{item.count}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

RatingDistribution.propTypes = {
  data: PropTypes.array.isRequired,
  avgRating: PropTypes.number.isRequired,
  loading: PropTypes.bool,
};

// Quick Action Card
const QuickActionCard = ({ icon: Icon, title, description, onClick, color = 'slate' }) => {
  const colors = {
    rose: 'bg-rose-100 text-rose-600',
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 30px -8px rgba(0,0,0,0.12)' }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <HiOutlineChevronRight className="w-5 h-5 text-slate-400" />
      </div>
    </motion.div>
  );
};

QuickActionCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  color: PropTypes.string,
};

// Booking Card
const BookingCard = ({ booking }) => {
  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700';
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPaymentColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'VERIFIED': return 'bg-emerald-100 text-emerald-700';
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
            <LuCar className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Booking #{booking.id}</p>
            <p className="text-xs text-slate-500">{booking.vehicleNo}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
          {booking.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <p className="text-slate-500">Vehicle Type</p>
          <p className="text-slate-800 font-medium">{booking.vehicleType}</p>
        </div>
        <div>
          <p className="text-slate-500">Hours</p>
          <p className="text-slate-800 font-medium">{booking.parkingHours}h</p>
        </div>
        <div>
          <p className="text-slate-500">Date</p>
          <p className="text-slate-800 font-medium">{booking.bookingDate}</p>
        </div>
        <div>
          <p className="text-slate-500">Price</p>
          <p className="text-rose-600 font-bold">₹{booking.price}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentColor(booking.paymentStatus)}`}>
          {booking.paymentStatus || 'PENDING'}
        </span>
        {booking.paymentUtrNumber && (
          <span className="text-xs text-slate-500">UTR: {booking.paymentUtrNumber}</span>
        )}
      </div>
    </motion.div>
  );
};

BookingCard.propTypes = {
  booking: PropTypes.object.isRequired,
  type: PropTypes.string,
};

// Main Component
const OwnerDashboardEnhanced = () => {
  const navigate = useNavigate();
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data states
  const [todaysBookings, setTodaysBookings] = useState([]);
  const [previousBookings, setPreviousBookings] = useState([]);
  const [parkingAreas, setParkingAreas] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [showPreviousBookings, setShowPreviousBookings] = useState(false);

  // Fetch owner data on mount
  useEffect(() => {
    const storedOwner = sessionStorage.getItem('user');
    if (storedOwner) {
      const parsed = JSON.parse(storedOwner);
      setOwner(parsed);
    }
  }, []);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    if (!owner?.id) return;
    
    setLoading(true);
    try {
      const [bookingsRes, previousRes, areasRes] = await Promise.all([
        api.get(`http://localhost:8080/booking/today/${owner.id}`).catch(() => ({ data: [] })),
        api.get(`http://localhost:8080/booking/previous/${owner.id}`).catch(() => ({ data: [] })),
        api.get(`http://localhost:8080/owner/parking-areas`).catch(() => ({ data: [] })),
      ]);

      setTodaysBookings(bookingsRes.data || []);
      setPreviousBookings(previousRes.data || []);
      setParkingAreas(areasRes.data || []);

      // Try to fetch metrics
      try {
        const metricsRes = await api.get('http://localhost:8080/owner/analytics/my-metrics');
        setMetrics(metricsRes.data);
      } catch {
        console.log('Metrics not available');
        setMetrics(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  }, [owner?.id]);

  useEffect(() => {
    if (owner?.id) {
      fetchAllData();
    }
  }, [owner?.id, fetchAllData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
    toast.success('Dashboard refreshed!');
  };

  // Calculate stats from real data
  const stats = useMemo(() => {
    const todaysRevenue = todaysBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
    const previousRevenue = previousBookings.slice(0, 10).reduce((sum, b) => sum + (Number(b.price) || 0), 0);
    
    const totalSlots = parkingAreas.reduce((sum, area) => sum + (area.totalSlots || 0), 0);
    const availableSlots = parkingAreas.reduce((sum, area) => sum + (area.availableSlots || 0), 0);
    
    const avgRating = parkingAreas.length > 0 
      ? parkingAreas.reduce((sum, area) => sum + (area.avgRating || 0), 0) / parkingAreas.length 
      : 0;

    return {
      todaysBookings: todaysBookings.length,
      previousBookings: previousBookings.length,
      todaysRevenue,
      previousRevenue,
      totalAreas: parkingAreas.length,
      totalSlots,
      availableSlots,
      occupancyRate: totalSlots > 0 ? Math.round(((totalSlots - availableSlots) / totalSlots) * 100) : 0,
      avgRating: avgRating.toFixed(1),
    };
  }, [todaysBookings, previousBookings, parkingAreas]);

  // Generate revenue trend data from actual bookings
  const revenueData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      // Filter bookings for this day
      const dayBookings = [...todaysBookings, ...previousBookings].filter(b => {
        if (!b.bookingDate) return false;
        const bookingDate = new Date(b.bookingDate);
        return bookingDate.toDateString() === date.toDateString();
      });
      
      const dayRevenue = dayBookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
      
      data.push({
        day: dayName,
        revenue: dayRevenue,
      });
    }
    
    return data;
  }, [todaysBookings, previousBookings]);

  // Generate booking stats data
  const bookingStatsData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      const dayBookings = [...todaysBookings, ...previousBookings].filter(b => {
        if (!b.bookingDate) return false;
        const bookingDate = new Date(b.bookingDate);
        return bookingDate.toDateString() === date.toDateString();
      });
      
      const completed = dayBookings.filter(b => 
        b.status?.toUpperCase() === 'COMPLETED' || b.paymentStatus?.toUpperCase() === 'VERIFIED'
      ).length;
      
      data.push({
        day: dayName,
        bookings: dayBookings.length,
        completed,
      });
    }
    
    return data;
  }, [todaysBookings, previousBookings]);

  // Review sentiment data
  const reviewSentimentData = useMemo(() => {
    if (metrics) {
      return [
        { name: 'Positive', value: metrics.positiveReviews || 0 },
        { name: 'Neutral', value: metrics.neutralReviews || 0 },
        { name: 'Negative', value: metrics.negativeReviews || 0 },
      ];
    }
    // Calculate from parking areas ratings
    const totalReviews = parkingAreas.reduce((sum, a) => sum + (a.totalReviews || 0), 0);
    const avgRating = stats.avgRating;
    
    // Estimate sentiment distribution based on avg rating
    const positivePercent = Math.max(0, (avgRating - 2.5) / 2.5 * 80);
    const negativePercent = Math.max(0, (2.5 - avgRating) / 2.5 * 50);
    const neutralPercent = Math.max(0, 100 - positivePercent - negativePercent);
    
    return [
      { name: 'Positive', value: Math.round(totalReviews * positivePercent / 100) },
      { name: 'Neutral', value: Math.round(totalReviews * neutralPercent / 100) },
      { name: 'Negative', value: Math.round(totalReviews * negativePercent / 100) },
    ];
  }, [metrics, parkingAreas, stats.avgRating]);

  // Rating distribution data
  const ratingDistributionData = useMemo(() => {
    const totalReviews = parkingAreas.reduce((sum, a) => sum + (a.totalReviews || 0), 0);
    const avgRating = parseFloat(stats.avgRating) || 3.5;
    
    // Estimate distribution based on avg rating
    const distribution = [
      { rating: 5, count: 0, percentage: 0 },
      { rating: 4, count: 0, percentage: 0 },
      { rating: 3, count: 0, percentage: 0 },
      { rating: 2, count: 0, percentage: 0 },
      { rating: 1, count: 0, percentage: 0 },
    ];
    
    if (totalReviews > 0) {
      // Simple distribution estimation
      distribution[0].percentage = Math.min(100, Math.max(0, (avgRating - 3) * 25 + 20));
      distribution[1].percentage = Math.min(100, Math.max(0, 30));
      distribution[2].percentage = Math.min(100, Math.max(0, 20));
      distribution[3].percentage = Math.min(100, Math.max(0, (3 - avgRating) * 10 + 5));
      distribution[4].percentage = Math.min(100, Math.max(0, (2.5 - avgRating) * 10));
      
      // Normalize to 100%
      const total = distribution.reduce((s, d) => s + d.percentage, 0);
      distribution.forEach(d => {
        d.percentage = Math.round(d.percentage / total * 100);
        d.count = Math.round(totalReviews * d.percentage / 100);
      });
    }
    
    return distribution;
  }, [parkingAreas, stats.avgRating]);

  const trustScore = metrics?.trustScore || 85;
  const riskLevel = metrics?.riskLevel || 'LOW';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Sidebar */}
      <Sidebar variant="owner" user={owner} />

      {/* Main Content */}
      <main className="lg:ml-20 min-h-screen">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6"
          >
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
                Welcome back, {owner?.firstName || 'Owner'}! 👋
              </h1>
              <p className="text-slate-500 mt-1">Here&apos;s what&apos;s happening with your parking business</p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                <HiOutlineRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/AddParkingArea')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-medium rounded-xl shadow-lg shadow-rose-200 hover:shadow-xl transition-all"
              >
                <LuPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Parking</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            <StatCard
              icon={LuCalendarDays}
              label="Today's Bookings"
              value={stats.todaysBookings}
              color="rose"
              loading={loading}
            />
            <StatCard
              icon={HiOutlineCurrencyRupee}
              label="Today's Revenue"
              value={`₹${stats.todaysRevenue.toFixed(0)}`}
              change={stats.previousRevenue > 0 ? `+${Math.round((stats.todaysRevenue / stats.previousRevenue - 1) * 100)}%` : undefined}
              changeType={stats.todaysRevenue >= stats.previousRevenue ? 'positive' : 'negative'}
              color="emerald"
              loading={loading}
            />
            <StatCard
              icon={HiOutlineLocationMarker}
              label="Parking Areas"
              value={stats.totalAreas}
              color="blue"
              loading={loading}
              onClick={() => navigate('/owner/parking-areas')}
            />
            <StatCard
              icon={LuSquareParking}
              label="Total Slots"
              value={stats.totalSlots}
              change={`${stats.occupancyRate}% occupied`}
              changeType="neutral"
              color="purple"
              loading={loading}
            />
          </motion.div>

          {/* Charts Row */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
          >
            <div className="lg:col-span-2">
              <RevenueChart data={revenueData} loading={loading} />
            </div>
            <TrustScoreGauge score={trustScore} riskLevel={riskLevel} loading={loading} />
          </motion.div>

          {/* Second Charts Row */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
          >
            <div className="lg:col-span-2">
              <BookingStatsChart data={bookingStatsData} loading={loading} />
            </div>
            <ReviewsPieChart data={reviewSentimentData} loading={loading} />
          </motion.div>

          {/* Rating Distribution & More Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
          >
            <RatingDistribution 
              data={ratingDistributionData} 
              avgRating={parseFloat(stats.avgRating) || 0} 
              loading={loading} 
            />
            
            {/* Additional Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="text-slate-600">Occupancy Rate</span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">{stats.occupancyRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <HiOutlineStar className="w-5 h-5 text-amber-600" />
                    </div>
                    <span className="text-slate-600">Avg Rating</span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">{stats.avgRating} ⭐</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <LuCar className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-slate-600">Available Slots</span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">{stats.availableSlots}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <LuHistory className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-slate-600">Total Bookings</span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">{stats.todaysBookings + stats.previousBookings}</span>
                </div>
              </div>
            </div>

            {/* Issues & Alerts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Issues & Alerts</h3>
              <div className="space-y-3">
                {metrics?.securityFlags > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                    <HiOutlineExclamationCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-700">{metrics.securityFlags} security concerns</span>
                  </div>
                )}
                {metrics?.cleanlinessFlags > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                    <HiOutlineExclamationCircle className="w-5 h-5 text-amber-500" />
                    <span className="text-sm text-amber-700">{metrics.cleanlinessFlags} cleanliness issues</span>
                  </div>
                )}
                {(!metrics?.securityFlags && !metrics?.cleanlinessFlags) && (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                    <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm text-emerald-700">No active issues</span>
                  </div>
                )}
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/owner/review-analytics')}
                    className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                  >
                    View detailed analytics
                    <HiOutlineChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickActionCard
                icon={LuPlus}
                title="Add Parking Area"
                description="Create new location"
                color="rose"
                onClick={() => navigate('/AddParkingArea')}
              />
              <QuickActionCard
                icon={HiOutlineCreditCard}
                title="Review Payments"
                description="Verify customer payments"
                color="emerald"
                onClick={() => navigate('/owner/payment-review')}
              />
              <QuickActionCard
                icon={HiOutlineCog}
                title="Payment Settings"
                description="Configure UPI details"
                color="blue"
                onClick={() => navigate('/owner/payment-settings')}
              />
              <QuickActionCard
                icon={HiOutlineTrendingUp}
                title="Analytics"
                description="View detailed insights"
                color="purple"
                onClick={() => navigate('/owner/review-analytics')}
              />
            </div>
          </motion.div>

          {/* Today's Bookings */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Today&apos;s Bookings</h2>
                <p className="text-sm text-slate-500">{todaysBookings.length} bookings today</p>
              </div>
              <button
                onClick={() => setShowPreviousBookings(!showPreviousBookings)}
                className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
              >
                {showPreviousBookings ? 'Hide' : 'Show'} Previous
                <HiOutlineChevronRight className={`w-4 h-4 transition-transform ${showPreviousBookings ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-slate-100">
                    <Skeleton className="h-10 w-full mb-3" />
                    <Skeleton className="h-20 w-full mb-3" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </div>
            ) : todaysBookings.length > 0 ? (
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {todaysBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} type="today" />
                ))}
              </motion.div>
            ) : (
              <div className="bg-white rounded-xl p-8 border border-slate-100 text-center">
                <LuCalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium">No bookings today</p>
                <p className="text-sm text-slate-500 mt-1">New bookings will appear here</p>
              </div>
            )}
          </motion.div>

          {/* Previous Bookings */}
          <AnimatePresence>
            {showPreviousBookings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <h2 className="text-xl font-bold text-slate-800 mb-4">Previous Bookings</h2>
                {previousBookings.length > 0 ? (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {previousBookings.slice(0, 6).map((booking) => (
                      <BookingCard key={booking.id} booking={booking} type="previous" />
                    ))}
                  </motion.div>
                ) : (
                  <div className="bg-white rounded-xl p-8 border border-slate-100 text-center">
                    <LuHistory className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">No previous bookings</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default OwnerDashboardEnhanced;

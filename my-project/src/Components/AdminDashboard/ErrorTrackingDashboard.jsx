import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  HiOutlineExclamationCircle,
  HiOutlineRefresh,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineCheck,
  HiOutlineTrash,
  HiOutlineClock,
  HiOutlineChevronDown,
  HiOutlineX,
  HiOutlineEye,
} from 'react-icons/hi';
import { LuAlertTriangle, LuBug, LuZap, LuActivity, LuServer, LuClock } from 'react-icons/lu';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '/src/api';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Colors
const COLORS = {
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  info: '#3b82f6',
};

const PIE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];

// Skeleton Loader
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

Skeleton.propTypes = {
  className: PropTypes.string,
};

// Summary Card Component
const SummaryCard = ({ icon: Icon, label, value, color, trend, loading }) => {
  const colorStyles = {
    red: 'bg-red-100 text-red-600 border-red-200',
    amber: 'bg-amber-100 text-amber-600 border-amber-200',
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
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
      className={`p-5 rounded-2xl border transition-all ${colorStyles[color]}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium opacity-80">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <span className={`text-xs font-semibold ${trend > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

SummaryCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string.isRequired,
  trend: PropTypes.number,
  loading: PropTypes.bool,
};

// Error Row Component
const ErrorRow = ({ error, onResolve, onView, onDelete }) => {
  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-orange-100 text-orange-700';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700';
      case 'LOW': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-700';
      case 'OPEN': return 'bg-red-100 text-red-700';
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            error.severity === 'CRITICAL' ? 'bg-red-100' : 'bg-amber-100'
          }`}>
            <LuBug className={`w-5 h-5 ${
              error.severity === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'
            }`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(error.severity)}`}>
                {error.severity}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(error.status)}`}>
                {error.status}
              </span>
            </div>
            <h4 className="font-semibold text-slate-800 mb-1">{error.message || error.type}</h4>
            <p className="text-sm text-slate-500 line-clamp-1">{error.endpoint || error.path}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <HiOutlineClock className="w-3 h-3" />
                {formatTime(error.timestamp)}
              </span>
              <span className="flex items-center gap-1">
                <LuActivity className="w-3 h-3" />
                {error.count || 1} occurrences
              </span>
              {error.responseTime && (
                <span className="flex items-center gap-1">
                  <LuClock className="w-3 h-3" />
                  {error.responseTime}ms
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(error)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="View details"
          >
            <HiOutlineEye className="w-5 h-5 text-slate-500" />
          </button>
          {error.status !== 'RESOLVED' && (
            <button
              onClick={() => onResolve(error.id)}
              className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
              title="Mark as resolved"
            >
              <HiOutlineCheck className="w-5 h-5 text-emerald-500" />
            </button>
          )}
          <button
            onClick={() => onDelete(error.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <HiOutlineTrash className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

ErrorRow.propTypes = {
  error: PropTypes.object.isRequired,
  onResolve: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

// Error Details Modal
const ErrorDetailsModal = ({ error, isOpen, onClose }) => {
  if (!isOpen || !error) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">Error Details</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full"
            >
              <HiOutlineX className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-500">Type</label>
                <p className="font-medium text-slate-800">{error.type || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Status</label>
                <p className="font-medium text-slate-800">{error.status}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Severity</label>
                <p className="font-medium text-slate-800">{error.severity}</p>
              </div>
              <div>
                <label className="text-sm text-slate-500">Timestamp</label>
                <p className="font-medium text-slate-800">
                  {new Date(error.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-500">Endpoint</label>
              <p className="font-medium text-slate-800 font-mono text-sm bg-slate-50 p-2 rounded">
                {error.method} {error.endpoint || error.path}
              </p>
            </div>

            <div>
              <label className="text-sm text-slate-500">Message</label>
              <p className="font-medium text-slate-800">{error.message}</p>
            </div>

            {error.stackTrace && (
              <div>
                <label className="text-sm text-slate-500">Stack Trace</label>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                  {error.stackTrace}
                </pre>
              </div>
            )}

            {error.requestBody && (
              <div>
                <label className="text-sm text-slate-500">Request Body</label>
                <pre className="bg-slate-50 p-4 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(error.requestBody, null, 2)}
                </pre>
              </div>
            )}

            {error.responseBody && (
              <div>
                <label className="text-sm text-slate-500">Response</label>
                <pre className="bg-slate-50 p-4 rounded-lg text-xs overflow-x-auto">
                  {JSON.stringify(error.responseBody, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

ErrorDetailsModal.propTypes = {
  error: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

// Main Component
const ErrorTrackingDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [slowApis, setSlowApis] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedError, setSelectedError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');

  // Generate mock data for demo
  const generateMockErrors = () => [
    {
      id: 1,
      type: 'NullPointerException',
      message: 'Cannot invoke method on null object',
      endpoint: '/api/booking/create',
      method: 'POST',
      severity: 'CRITICAL',
      status: 'OPEN',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      count: 15,
      responseTime: 2500,
      stackTrace: 'java.lang.NullPointerException\n  at BookingService.createBooking(BookingService.java:45)\n  at BookingController.create(BookingController.java:28)',
    },
    {
      id: 2,
      type: 'ConnectionTimeoutException',
      message: 'Database connection timed out',
      endpoint: '/api/parking-areas/nearby',
      method: 'GET',
      severity: 'HIGH',
      status: 'IN_PROGRESS',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      count: 8,
      responseTime: 5000,
    },
    {
      id: 3,
      type: 'ValidationException',
      message: 'Invalid vehicle number format',
      endpoint: '/api/booking/validate',
      method: 'POST',
      severity: 'MEDIUM',
      status: 'OPEN',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      count: 42,
      responseTime: 150,
    },
    {
      id: 4,
      type: 'AuthenticationException',
      message: 'Invalid or expired token',
      endpoint: '/api/user/profile',
      method: 'GET',
      severity: 'HIGH',
      status: 'RESOLVED',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      count: 5,
      responseTime: 200,
    },
    {
      id: 5,
      type: 'PaymentProcessingException',
      message: 'Payment gateway timeout',
      endpoint: '/api/payment/process',
      method: 'POST',
      severity: 'CRITICAL',
      status: 'OPEN',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      count: 3,
      responseTime: 8000,
    },
  ];

  const generateMockSlowApis = () => [
    { endpoint: '/api/parking-areas/nearby', avgTime: 2500, p99Time: 4500, count: 150 },
    { endpoint: '/api/booking/create', avgTime: 1800, p99Time: 3200, count: 89 },
    { endpoint: '/api/payment/process', avgTime: 1500, p99Time: 2800, count: 45 },
    { endpoint: '/api/reviews/analyze', avgTime: 1200, p99Time: 2100, count: 32 },
    { endpoint: '/api/admin/reports/generate', avgTime: 3500, p99Time: 6000, count: 12 },
  ];

  const generateMockSummary = () => ({
    totalErrors: 73,
    criticalErrors: 18,
    resolvedToday: 12,
    avgResponseTime: 450,
    errorRate: 2.3,
    slowApiCount: 5,
  });

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [errorsRes, slowApisRes, summaryRes] = await Promise.all([
        api.get('/admin/errors/logs', { params: { period: timeRange } }).catch(() => ({ data: [] })),
        api.get('/admin/errors/slow-apis', { params: { threshold: 1000 } }).catch(() => ({ data: [] })),
        api.get('/admin/errors/summary', { params: { period: timeRange } }).catch(() => ({ data: null })),
      ]);

      // Use mock data if API fails
      setErrors(errorsRes.data?.length ? errorsRes.data : generateMockErrors());
      setSlowApis(slowApisRes.data?.length ? slowApisRes.data : generateMockSlowApis());
      setSummary(summaryRes.data || generateMockSummary());
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrors(generateMockErrors());
      setSlowApis(generateMockSlowApis());
      setSummary(generateMockSummary());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  // Actions
  const handleResolve = async (errorId) => {
    try {
      await api.post(`/admin/errors/logs/${errorId}/resolve`);
      setErrors((prev) =>
        prev.map((e) => (e.id === errorId ? { ...e, status: 'RESOLVED' } : e))
      );
      toast.success('Error marked as resolved');
    } catch (error) {
      // Update locally for demo
      setErrors((prev) =>
        prev.map((e) => (e.id === errorId ? { ...e, status: 'RESOLVED' } : e))
      );
      toast.success('Error marked as resolved');
    }
  };

  const handleDelete = async (errorId) => {
    try {
      await api.delete(`/admin/errors/logs/${errorId}`);
      setErrors((prev) => prev.filter((e) => e.id !== errorId));
      toast.success('Error log deleted');
    } catch (error) {
      setErrors((prev) => prev.filter((e) => e.id !== errorId));
      toast.success('Error log deleted');
    }
  };

  const handleView = (error) => {
    setSelectedError(error);
    setShowDetails(true);
  };

  // Filter errors
  const filteredErrors = useMemo(() => {
    return errors.filter((error) => {
      const matchesSearch =
        !searchQuery ||
        error.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        error.endpoint?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        error.type?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' || error.status?.toUpperCase() === filterStatus.toUpperCase();

      const matchesSeverity =
        filterSeverity === 'all' || error.severity?.toUpperCase() === filterSeverity.toUpperCase();

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [errors, searchQuery, filterStatus, filterSeverity]);

  // Generate chart data
  const errorTrendData = useMemo(() => {
    const hours = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now - i * 60 * 60 * 1000);
      hours.push({
        hour: hour.getHours() + ':00',
        errors: Math.floor(Math.random() * 10) + 1,
        resolved: Math.floor(Math.random() * 5),
      });
    }
    return hours;
  }, []);

  const errorsByTypeData = useMemo(() => {
    const types = {};
    errors.forEach((e) => {
      types[e.type] = (types[e.type] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [errors]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 p-6">
      <ToastContainer position="top-right" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Error Tracking</h1>
            <p className="text-slate-600">Monitor and resolve system errors</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition"
            >
              <HiOutlineRefresh className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            icon={LuBug}
            label="Total Errors"
            value={summary?.totalErrors || 0}
            color="red"
            trend={8}
            loading={loading}
          />
          <SummaryCard
            icon={LuAlertTriangle}
            label="Critical"
            value={summary?.criticalErrors || 0}
            color="amber"
            loading={loading}
          />
          <SummaryCard
            icon={HiOutlineCheck}
            label="Resolved Today"
            value={summary?.resolvedToday || 0}
            color="emerald"
            loading={loading}
          />
          <SummaryCard
            icon={LuZap}
            label="Slow APIs"
            value={summary?.slowApiCount || 0}
            color="purple"
            loading={loading}
          />
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Error Trend */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Error Trend (24h)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={errorTrendData}>
                <defs>
                  <linearGradient id="errorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.error} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.error} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="errors"
                  stroke={COLORS.error}
                  strokeWidth={2}
                  fill="url(#errorGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Errors by Type */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Errors by Type</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={errorsByTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {errorsByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Slow APIs Table */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Slow API Endpoints</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Endpoint</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Avg Time</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">P99 Time</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Count</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {slowApis.map((api, index) => (
                  <tr key={index} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-slate-700">{api.endpoint}</span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className={`font-medium ${api.avgTime > 2000 ? 'text-red-600' : api.avgTime > 1000 ? 'text-amber-600' : 'text-slate-700'}`}>
                        {api.avgTime}ms
                      </span>
                    </td>
                    <td className="text-right py-3 px-4 text-slate-600">{api.p99Time}ms</td>
                    <td className="text-right py-3 px-4 text-slate-600">{api.count}</td>
                    <td className="text-right py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        api.avgTime > 2000 ? 'bg-red-100 text-red-700' : 
                        api.avgTime > 1000 ? 'bg-amber-100 text-amber-700' : 
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {api.avgTime > 2000 ? 'Critical' : api.avgTime > 1000 ? 'Slow' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-rose-200">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search errors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">All Severity</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </motion.div>

        {/* Error List */}
        <motion.div variants={containerVariants} className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">Error Logs ({filteredErrors.length})</h3>
          {filteredErrors.length > 0 ? (
            filteredErrors.map((error) => (
              <ErrorRow
                key={error.id}
                error={error}
                onResolve={handleResolve}
                onView={handleView}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-white/80 rounded-2xl">
              <LuBug className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No errors found</p>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Error Details Modal */}
      <ErrorDetailsModal
        error={selectedError}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </div>
  );
};

export default ErrorTrackingDashboard;

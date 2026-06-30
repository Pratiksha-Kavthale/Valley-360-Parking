import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  LuCalendarDays,
  LuCircleDollarSign,
  LuRefreshCw,
  LuCar,
  LuUsers,
} from 'react-icons/lu';
import {
  HiOutlineLocationMarker,
  HiOutlineUserCircle,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineExclamation,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
  HiOutlineCreditCard,
  HiOutlineQrcode,
  HiOutlineLightningBolt,
  HiOutlineBell,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import api from '/src/api';
import Sidebar from '../ui/Sidebar';

// Chart colors
const COLORS = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

// Skeleton Loader Component
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'rose', loading }) => {
  const colorClasses = {
    rose: 'from-rose-500 to-rose-600',
    orange: 'from-orange-500 to-orange-600',
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="w-12 h-12 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)' }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend === 'up' ? <HiOutlineTrendingUp className="w-4 h-4" /> : <HiOutlineTrendingDown className="w-4 h-4" />}
              <span className="font-medium">{trendValue}</span>
              <span className="text-slate-400">vs last week</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

// Chart Card Component
const ChartCard = ({ title, subtitle, children, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
  >
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {loading ? (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full" />
      </div>
    ) : (
      children
    )}
  </motion.div>
);

// Activity Item Component
const ActivityItem = ({ icon: Icon, title, description, time, type }) => {
  const typeColors = {
    success: 'bg-emerald-100 text-emerald-600',
    warning: 'bg-amber-100 text-amber-600',
    error: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${typeColors[type] || typeColors.info}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <span className="text-xs text-slate-400 whitespace-nowrap">{time}</span>
    </div>
  );
};

// Quick Action Button Component
const QuickAction = ({ icon: Icon, label, onClick, color = 'slate' }) => {
  const colorClasses = {
    rose: 'hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200',
    emerald: 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200',
    blue: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200',
    slate: 'hover:bg-slate-50 hover:text-slate-700 hover:border-slate-200',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl text-slate-600 transition-all ${colorClasses[color]}`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      <HiOutlineChevronRight className="w-4 h-4 ml-auto opacity-50" />
    </motion.button>
  );
};

const AdminDashboardNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    parkingSlots: 0,
    parkingAreas: 0,
    owners: 0,
    customers: 0,
    activeBookings: 0,
    availableSlots: 0,
    totalRevenue: 0,
    utilizationRate: 0,
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Mock data for charts - in production, fetch from API
  const weeklyBookings = useMemo(() => [
    { name: 'Mon', bookings: 45, revenue: 2250 },
    { name: 'Tue', bookings: 52, revenue: 2600 },
    { name: 'Wed', bookings: 48, revenue: 2400 },
    { name: 'Thu', bookings: 70, revenue: 3500 },
    { name: 'Fri', bookings: 85, revenue: 4250 },
    { name: 'Sat', bookings: 92, revenue: 4600 },
    { name: 'Sun', bookings: 65, revenue: 3250 },
  ], []);

  const monthlyRevenue = useMemo(() => [
    { name: 'Jan', revenue: 45000 },
    { name: 'Feb', revenue: 52000 },
    { name: 'Mar', revenue: 48000 },
    { name: 'Apr', revenue: 61000 },
    { name: 'May', revenue: 55000 },
    { name: 'Jun', revenue: 72000 },
  ], []);

  const peakHours = useMemo(() => [
    { hour: '6AM', occupancy: 15 },
    { hour: '8AM', occupancy: 65 },
    { hour: '10AM', occupancy: 80 },
    { hour: '12PM', occupancy: 95 },
    { hour: '2PM', occupancy: 85 },
    { hour: '4PM', occupancy: 75 },
    { hour: '6PM', occupancy: 90 },
    { hour: '8PM', occupancy: 60 },
    { hour: '10PM', occupancy: 30 },
  ], []);

  const slotDistribution = useMemo(() => [
    { name: 'Two Wheeler', value: 120, fill: COLORS[0] },
    { name: 'Four Wheeler', value: 80, fill: COLORS[1] },
    { name: 'Heavy Vehicle', value: 30, fill: COLORS[2] },
    { name: 'EV Charging', value: 20, fill: COLORS[3] },
  ], []);

  const recentActivities = useMemo(() => [
    { icon: HiOutlineCheckCircle, title: 'New booking confirmed', description: 'Slot A-15 booked by John Doe', time: '2 min ago', type: 'success' },
    { icon: LuUsers, title: 'New owner registered', description: 'Parking Solutions Inc. joined', time: '15 min ago', type: 'info' },
    { icon: HiOutlineExclamation, title: 'Low trust score alert', description: 'Owner ID #234 flagged for review', time: '1 hour ago', type: 'warning' },
    { icon: HiOutlineCreditCard, title: 'Payment verified', description: 'Booking #1234 payment confirmed', time: '2 hours ago', type: 'success' },
    { icon: HiOutlineLightningBolt, title: 'High traffic detected', description: 'Zone B experiencing peak usage', time: '3 hours ago', type: 'info' },
  ], []);

  const systemAlerts = useMemo(() => [
    { icon: HiOutlineExclamation, title: '3 pending payment verifications', description: 'Requires immediate attention', time: 'Now', type: 'warning' },
    { icon: HiOutlineShieldCheck, title: '2 owners need review', description: 'Trust score below threshold', time: '1h ago', type: 'error' },
  ], []);

  const fetchData = async () => {
    try {
      const response = await api.get('http://localhost:8080/Admin/dashboard');
      setData({
        ...response.data,
        activeBookings: Math.floor(response.data.parkingSlots * 0.7),
        availableSlots: Math.floor(response.data.parkingSlots * 0.3),
        totalRevenue: response.data.parkingSlots * 150,
        utilizationRate: 72,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Sidebar */}
      <Sidebar variant="admin" user={user} />

      {/* Main Content */}
      <main className="lg:ml-20 min-h-screen">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Admin Dashboard</h1>
              <p className="text-slate-500 mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                <LuRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all"
              >
                <HiOutlineBell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  3
                </span>
              </motion.button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <StatCard
              title="Total Parking Areas"
              value={data.parkingAreas}
              icon={HiOutlineLocationMarker}
              trend="up"
              trendValue="+12%"
              color="rose"
              loading={loading}
            />
            <StatCard
              title="Total Parking Slots"
              value={data.parkingSlots}
              icon={LuCar}
              trend="up"
              trendValue="+8%"
              color="orange"
              loading={loading}
            />
            <StatCard
              title="Active Bookings"
              value={data.activeBookings}
              icon={LuCalendarDays}
              trend="up"
              trendValue="+23%"
              color="emerald"
              loading={loading}
            />
            <StatCard
              title="Available Slots"
              value={data.availableSlots}
              icon={HiOutlineCheckCircle}
              color="blue"
              loading={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <StatCard
              title="Total Owners"
              value={data.owners}
              icon={HiOutlineUserCircle}
              trend="up"
              trendValue="+5%"
              color="purple"
              loading={loading}
            />
            <StatCard
              title="Total Customers"
              value={data.customers}
              icon={LuUsers}
              trend="up"
              trendValue="+18%"
              color="amber"
              loading={loading}
            />
            <StatCard
              title="Total Revenue"
              value={`₹${(data.totalRevenue / 1000).toFixed(1)}K`}
              icon={LuCircleDollarSign}
              trend="up"
              trendValue="+15%"
              color="emerald"
              loading={loading}
            />
            <StatCard
              title="Utilization Rate"
              value={`${data.utilizationRate}%`}
              icon={HiOutlineTrendingUp}
              trend="up"
              trendValue="+4%"
              color="rose"
              loading={loading}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Bookings Chart */}
            <ChartCard title="Weekly Booking Trends" subtitle="Bookings per day this week" loading={loading}>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyBookings}>
                    <defs>
                      <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      fill="url(#bookingGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Monthly Revenue Chart */}
            <ChartCard title="Monthly Revenue" subtitle="Revenue trend over 6 months" loading={loading}>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `₹${v / 1000}K`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#f97316" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Peak Hours Chart */}
            <ChartCard title="Peak Hour Analysis" subtitle="Parking occupancy by hour" loading={loading}>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value) => [`${value}%`, 'Occupancy']}
                    />
                    <Line
                      type="monotone"
                      dataKey="occupancy"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={{ fill: '#22c55e', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#22c55e' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Slot Distribution Pie Chart */}
            <ChartCard title="Slot Distribution" subtitle="Breakdown by vehicle type" loading={loading}>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={slotDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {slotDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Recent Activities</h3>
                  <button className="text-sm text-rose-500 font-medium hover:text-rose-600">View All</button>
                </div>
                <div className="space-y-1">
                  {recentActivities.map((activity, index) => (
                    <ActivityItem key={index} {...activity} />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* System Alerts */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">System Alerts</h3>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                    {systemAlerts.length} Active
                  </span>
                </div>
                <div className="space-y-1">
                  {systemAlerts.map((alert, index) => (
                    <ActivityItem key={index} {...alert} />
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <QuickAction
                    icon={HiOutlineShieldCheck}
                    label="Risk Monitor"
                    onClick={() => navigate('/admin/owner-risk')}
                    color="rose"
                  />
                  <QuickAction
                    icon={HiOutlineCreditCard}
                    label="Payment Queue"
                    onClick={() => navigate('/admin/payment-review')}
                    color="emerald"
                  />
                  <QuickAction
                    icon={HiOutlineQrcode}
                    label="Validate QR"
                    onClick={() => navigate('/ValidateBookingQR')}
                    color="blue"
                  />
                  <QuickAction
                    icon={HiOutlineTrendingUp}
                    label="Analytics"
                    onClick={() => navigate('/admin/review-analytics')}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardNew;

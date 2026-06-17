import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineTrash,
  HiOutlineArchive,
  HiOutlineRefresh,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineDownload,
  HiOutlineClock,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineChevronDown,
  HiOutlineX,
} from 'react-icons/hi';
import { LuSquareParking, LuCalendarDays, LuTrendingUp, LuAlertTriangle } from 'react-icons/lu';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '/src/api';
import PropTypes from 'prop-types';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Summary Card Component
const SummaryCard = ({ icon: Icon, label, value, color, onClick }) => {
  const colorStyles = {
    red: 'bg-red-100 text-red-600 border-red-200',
    amber: 'bg-amber-100 text-amber-600 border-amber-200',
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, boxShadow: '0 12px 30px -8px rgba(0,0,0,0.12)' }}
      onClick={onClick}
      className={`p-5 rounded-2xl border cursor-pointer transition-all ${colorStyles[color]}`}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-8 h-8" />
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
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
  onClick: PropTypes.func,
};

// Action Button Component
const ActionButton = ({ icon: Icon, label, onClick, variant = 'default', disabled = false }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    warning: 'bg-amber-500 text-white hover:bg-amber-600',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600',
    primary: 'bg-rose-500 text-white hover:bg-rose-600',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all ${variants[variant]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
};

ActionButton.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.string,
  disabled: PropTypes.bool,
};

// Confirmation Modal
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      icon: HiOutlineTrash,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      icon: LuAlertTriangle,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      buttonBg: 'bg-amber-500 hover:bg-amber-600',
    },
    success: {
      icon: HiOutlineCheckCircle,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      buttonBg: 'bg-emerald-500 hover:bg-emerald-600',
    },
  };

  const style = typeStyles[type];
  const IconComponent = style.icon;

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
          className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center`}>
              <IconComponent className={`w-6 h-6 ${style.iconColor}`} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          </div>
          <p className="text-slate-600 mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-4 py-2 rounded-lg text-white font-medium transition ${style.buttonBg}`}
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.string,
};

// Resource Card Component
const ResourceCard = ({ resource, type, selected, onSelect, onAction }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysSinceActive = (lastActiveDate) => {
    if (!lastActiveDate) return 'N/A';
    const lastActive = new Date(lastActiveDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastActive);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isArea = type === 'area';
  const daysSinceActive = getDaysSinceActive(resource.lastActiveDate);
  const urgencyLevel = daysSinceActive > 60 ? 'critical' : daysSinceActive > 45 ? 'high' : 'medium';

  const urgencyStyles = {
    critical: 'border-red-300 bg-red-50',
    high: 'border-amber-300 bg-amber-50',
    medium: 'border-blue-300 bg-blue-50',
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`p-5 rounded-xl border-2 transition-all ${urgencyStyles[urgencyLevel]} ${
        selected ? 'ring-2 ring-rose-500' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(resource.id)}
            className="w-5 h-5 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
          />
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
            <LuSquareParking className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">
              {isArea ? resource.name || resource.area : `Slot ${resource.slotNumber}`}
            </h3>
            <p className="text-sm text-slate-500">
              {isArea ? resource.city : resource.areaName}
            </p>
          </div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            urgencyLevel === 'critical'
              ? 'bg-red-100 text-red-700'
              : urgencyLevel === 'high'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          {daysSinceActive} days inactive
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
        <div>
          <p className="text-slate-500">Last Active</p>
          <p className="font-medium text-slate-800">{formatDate(resource.lastActiveDate)}</p>
        </div>
        {isArea && (
          <div>
            <p className="text-slate-500">Slot Count</p>
            <p className="font-medium text-slate-800">{resource.totalSlots || 0}</p>
          </div>
        )}
        <div>
          <p className="text-slate-500">Total Bookings</p>
          <p className="font-medium text-slate-800">{resource.totalBookings || 0}</p>
        </div>
        <div>
          <p className="text-slate-500">Revenue</p>
          <p className="font-medium text-emerald-600">₹{resource.totalRevenue || 0}</p>
        </div>
      </div>

      {resource.ownerName && (
        <div className="flex items-center gap-4 mb-4 text-sm border-t border-slate-200 pt-3">
          <div className="flex items-center gap-1 text-slate-600">
            <span className="font-medium">Owner:</span> {resource.ownerName}
          </div>
          {resource.ownerEmail && (
            <div className="flex items-center gap-1 text-slate-500">
              <HiOutlineMail className="w-4 h-4" />
              {resource.ownerEmail}
            </div>
          )}
          {resource.ownerPhone && (
            <div className="flex items-center gap-1 text-slate-500">
              <HiOutlinePhone className="w-4 h-4" />
              {resource.ownerPhone}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onAction('delete', resource)}
          className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition flex items-center gap-1"
        >
          <HiOutlineTrash className="w-4 h-4" />
          Delete
        </button>
        <button
          type="button"
          onClick={() => onAction('archive', resource)}
          className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium hover:bg-amber-200 transition flex items-center gap-1"
        >
          <HiOutlineArchive className="w-4 h-4" />
          Archive
        </button>
        <button
          type="button"
          onClick={() => onAction('activate', resource)}
          className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium hover:bg-emerald-200 transition flex items-center gap-1"
        >
          <HiOutlineCheckCircle className="w-4 h-4" />
          Mark Active
        </button>
        <button
          type="button"
          onClick={() => onAction('notify', resource)}
          className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition flex items-center gap-1"
        >
          <HiOutlineMail className="w-4 h-4" />
          Send Warning
        </button>
      </div>
    </motion.div>
  );
};

ResourceCard.propTypes = {
  resource: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
};

// Main Component
const AdminCleanupReview = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('areas');
  const [inactiveAreas, setInactiveAreas] = useState([]);
  const [inactiveSlots, setInactiveSlots] = useState([]);
  const [archivedAreas, setArchivedAreas] = useState([]);
  const [archivedSlots, setArchivedSlots] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [daysFilter, setDaysFilter] = useState(45);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [areasRes, slotsRes, archivedAreasRes, archivedSlotsRes] = await Promise.all([
        api.get('/admin/cleanup/inactive-areas', { params: { daysInactive: daysFilter } }).catch(() => ({ data: [] })),
        api.get('/admin/cleanup/inactive-slots', { params: { daysInactive: daysFilter } }).catch(() => ({ data: [] })),
        api.get('/admin/cleanup/archived-areas').catch(() => ({ data: [] })),
        api.get('/admin/cleanup/archived-slots').catch(() => ({ data: [] })),
      ]);

      // Mock data for demo if API doesn't return data
      setInactiveAreas(areasRes.data?.length ? areasRes.data : generateMockAreas());
      setInactiveSlots(slotsRes.data?.length ? slotsRes.data : generateMockSlots());
      setArchivedAreas(archivedAreasRes.data || []);
      setArchivedSlots(archivedSlotsRes.data || []);
    } catch (error) {
      console.error('Error fetching cleanup data:', error);
      // Use mock data for demo
      setInactiveAreas(generateMockAreas());
      setInactiveSlots(generateMockSlots());
      toast.error('Using demo data - API connection failed');
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for demo
  const generateMockAreas = () => [
    {
      id: 1,
      name: 'Downtown Parking Plaza',
      area: 'Downtown',
      city: 'Mumbai',
      lastActiveDate: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
      totalSlots: 25,
      totalBookings: 150,
      totalRevenue: 45000,
      ownerName: 'Rahul Sharma',
      ownerEmail: 'rahul@example.com',
      ownerPhone: '+91 9876543210',
    },
    {
      id: 2,
      name: 'Airport Parking Lot',
      area: 'Airport Zone',
      city: 'Delhi',
      lastActiveDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
      totalSlots: 50,
      totalBookings: 320,
      totalRevenue: 125000,
      ownerName: 'Priya Patel',
      ownerEmail: 'priya@example.com',
      ownerPhone: '+91 8765432109',
    },
    {
      id: 3,
      name: 'Mall Basement Parking',
      area: 'Commercial District',
      city: 'Bangalore',
      lastActiveDate: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString(),
      totalSlots: 100,
      totalBookings: 890,
      totalRevenue: 275000,
      ownerName: 'Amit Kumar',
      ownerEmail: 'amit@example.com',
      ownerPhone: '+91 7654321098',
    },
  ];

  const generateMockSlots = () => [
    {
      id: 1,
      slotNumber: 'A-101',
      areaName: 'Downtown Parking Plaza',
      lastActiveDate: new Date(Date.now() - 52 * 24 * 60 * 60 * 1000).toISOString(),
      totalBookings: 45,
      totalRevenue: 5400,
    },
    {
      id: 2,
      slotNumber: 'B-205',
      areaName: 'Airport Parking Lot',
      lastActiveDate: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
      totalBookings: 12,
      totalRevenue: 1800,
    },
  ];

  useEffect(() => {
    fetchData();
  }, [daysFilter]);

  // Handle selection
  const handleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentList = activeTab === 'areas' ? inactiveAreas : inactiveSlots;
    if (selectedItems.length === currentList.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentList.map((item) => item.id));
    }
  };

  // Filter data
  const filteredAreas = useMemo(() => {
    return inactiveAreas.filter(
      (area) =>
        area.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.ownerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inactiveAreas, searchQuery]);

  const filteredSlots = useMemo(() => {
    return inactiveSlots.filter(
      (slot) =>
        slot.slotNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slot.areaName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inactiveSlots, searchQuery]);

  // Handle actions
  const handleAction = async (action, resource) => {
    const isArea = activeTab === 'areas';
    const resourceType = isArea ? 'area' : 'slot';

    switch (action) {
      case 'delete':
        setModalConfig({
          title: `Delete ${resourceType}?`,
          message: `Are you sure you want to permanently delete this ${resourceType}? This action cannot be undone.`,
          type: 'danger',
          onConfirm: async () => {
            try {
              await api.delete(`/admin/cleanup/${resourceType}/${resource.id}`);
              toast.success(`${resourceType} deleted successfully`);
              fetchData();
            } catch (error) {
              toast.error(`Failed to delete ${resourceType}`);
            }
            setShowModal(false);
          },
        });
        setShowModal(true);
        break;

      case 'archive':
        try {
          await api.post(`/admin/cleanup/${resourceType}/${resource.id}/archive`);
          toast.success(`${resourceType} archived successfully`);
          fetchData();
        } catch (error) {
          toast.error(`Failed to archive ${resourceType}`);
        }
        break;

      case 'activate':
        try {
          await api.post(`/admin/cleanup/${resourceType}/${resource.id}/activate`);
          toast.success(`${resourceType} marked as active`);
          fetchData();
        } catch (error) {
          toast.error(`Failed to activate ${resourceType}`);
        }
        break;

      case 'notify':
        setModalConfig({
          title: 'Send Deletion Warning?',
          message: `This will send an email and SMS notification to the owner about the upcoming deletion. They will have 24 hours to cancel.`,
          type: 'warning',
          onConfirm: async () => {
            try {
              await api.post('/notifications/deletion-warning', {
                resourceType,
                resourceId: resource.id,
                ownerId: resource.ownerId,
              });
              toast.success('Deletion warning sent successfully');
            } catch (error) {
              toast.error('Failed to send notification');
            }
            setShowModal(false);
          },
        });
        setShowModal(true);
        break;

      case 'restore':
        try {
          await api.post(`/admin/cleanup/${resourceType}/${resource.id}/restore`);
          toast.success(`${resourceType} restored successfully`);
          fetchData();
        } catch (error) {
          toast.error(`Failed to restore ${resourceType}`);
        }
        break;

      default:
        break;
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    const resourceType = activeTab === 'areas' ? 'areas' : 'slots';
    const endpoint = `/admin/cleanup/${resourceType}/bulk-${action}`;
    const idKey = activeTab === 'areas' ? 'areaIds' : 'slotIds';

    try {
      await api.post(endpoint, { [idKey]: selectedItems });
      toast.success(`Bulk ${action} completed successfully`);
      setSelectedItems([]);
      fetchData();
    } catch (error) {
      toast.error(`Failed to perform bulk ${action}`);
    }
  };

  // Generate report
  const handleGenerateReport = async () => {
    try {
      await api.post('/admin/cleanup/report/generate');
      toast.success('Report generated and sent to admin email');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  // Summary stats
  const summaryStats = useMemo(() => ({
    totalInactiveAreas: inactiveAreas.length,
    totalInactiveSlots: inactiveSlots.length,
    totalArchivedAreas: archivedAreas.length,
    totalArchivedSlots: archivedSlots.length,
    criticalAreas: inactiveAreas.filter((a) => {
      const days = Math.ceil((Date.now() - new Date(a.lastActiveDate)) / (1000 * 60 * 60 * 24));
      return days > 60;
    }).length,
    potentialRevenueImpact: inactiveAreas.reduce((sum, a) => sum + (a.totalRevenue || 0), 0) +
      inactiveSlots.reduce((sum, s) => sum + (s.totalRevenue || 0), 0),
  }), [inactiveAreas, inactiveSlots, archivedAreas, archivedSlots]);

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
            <h1 className="text-3xl font-bold text-slate-900">Cleanup Review</h1>
            <p className="text-slate-600">Manage inactive parking areas and slots</p>
          </div>
          <div className="flex gap-3">
            <ActionButton
              icon={HiOutlineRefresh}
              label="Refresh"
              onClick={fetchData}
            />
            <ActionButton
              icon={HiOutlineDownload}
              label="Generate Report"
              onClick={handleGenerateReport}
              variant="primary"
            />
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            icon={LuSquareParking}
            label="Inactive Areas"
            value={summaryStats.totalInactiveAreas}
            color="amber"
          />
          <SummaryCard
            icon={LuSquareParking}
            label="Inactive Slots"
            value={summaryStats.totalInactiveSlots}
            color="blue"
          />
          <SummaryCard
            icon={LuAlertTriangle}
            label="Critical (>60 days)"
            value={summaryStats.criticalAreas}
            color="red"
          />
          <SummaryCard
            icon={HiOutlineArchive}
            label="Archived"
            value={summaryStats.totalArchivedAreas + summaryStats.totalArchivedSlots}
            color="purple"
          />
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          variants={itemVariants}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-rose-200"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              {/* Tabs */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => { setActiveTab('areas'); setSelectedItems([]); }}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    activeTab === 'areas' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Parking Areas
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('slots'); setSelectedItems([]); }}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    activeTab === 'slots' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Parking Slots
                </button>
                <button
                  type="button"
                  onClick={() => { setActiveTab('archived'); setSelectedItems([]); }}
                  className={`px-4 py-2 rounded-md font-medium transition ${
                    activeTab === 'archived' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Archived
                </button>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              {/* Search */}
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:border-transparent w-64"
                />
              </div>

              {/* Days Filter */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
                >
                  <HiOutlineFilter className="w-5 h-5 text-slate-500" />
                  <span>{daysFilter}+ days</span>
                  <HiOutlineChevronDown className="w-4 h-4 text-slate-500" />
                </button>
                {showFilters && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-slate-200 p-3 z-10">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Inactive Days Threshold
                    </label>
                    <select
                      value={daysFilter}
                      onChange={(e) => setDaysFilter(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded border border-slate-200"
                    >
                      <option value={30}>30+ days</option>
                      <option value={45}>45+ days</option>
                      <option value={60}>60+ days</option>
                      <option value={90}>90+ days</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-4 p-3 bg-rose-50 rounded-lg border border-rose-200"
            >
              <span className="text-rose-700 font-medium">{selectedItems.length} items selected</span>
              <div className="flex gap-2">
                <ActionButton
                  icon={HiOutlineTrash}
                  label="Delete Selected"
                  onClick={() => handleBulkAction('delete')}
                  variant="danger"
                />
                <ActionButton
                  icon={HiOutlineArchive}
                  label="Archive Selected"
                  onClick={() => handleBulkAction('archive')}
                  variant="warning"
                />
                <button
                  type="button"
                  onClick={() => setSelectedItems([])}
                  className="px-3 py-2 text-slate-600 hover:text-slate-800"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Content */}
        <motion.div variants={containerVariants} className="space-y-4">
          {/* Select All */}
          {activeTab !== 'archived' && (
            <div className="flex items-center gap-3 px-2">
              <input
                type="checkbox"
                checked={selectedItems.length === (activeTab === 'areas' ? filteredAreas.length : filteredSlots.length)}
                onChange={handleSelectAll}
                className="w-5 h-5 rounded border-slate-300 text-rose-500 focus:ring-rose-500"
              />
              <span className="text-slate-600 font-medium">Select All</span>
            </div>
          )}

          {/* Areas Tab */}
          {activeTab === 'areas' && (
            filteredAreas.length > 0 ? (
              filteredAreas.map((area) => (
                <ResourceCard
                  key={area.id}
                  resource={area}
                  type="area"
                  selected={selectedItems.includes(area.id)}
                  onSelect={handleSelect}
                  onAction={handleAction}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white/80 rounded-2xl">
                <LuSquareParking className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg">No inactive parking areas found</p>
              </div>
            )
          )}

          {/* Slots Tab */}
          {activeTab === 'slots' && (
            filteredSlots.length > 0 ? (
              filteredSlots.map((slot) => (
                <ResourceCard
                  key={slot.id}
                  resource={slot}
                  type="slot"
                  selected={selectedItems.includes(slot.id)}
                  onSelect={handleSelect}
                  onAction={handleAction}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white/80 rounded-2xl">
                <LuSquareParking className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg">No inactive parking slots found</p>
              </div>
            )
          )}

          {/* Archived Tab */}
          {activeTab === 'archived' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Archived Parking Areas</h3>
              {archivedAreas.length > 0 ? (
                archivedAreas.map((area) => (
                  <motion.div
                    key={area.id}
                    variants={itemVariants}
                    className="p-4 bg-purple-50 rounded-xl border border-purple-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-800">{area.name}</h4>
                        <p className="text-sm text-slate-500">Archived on {new Date(area.archivedDate).toLocaleDateString()}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAction('restore', area)}
                        className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-200 transition flex items-center gap-1"
                      >
                        <HiOutlineRefresh className="w-4 h-4" />
                        Restore
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-slate-500">No archived areas</p>
              )}

              <h3 className="text-lg font-semibold text-slate-800 mt-6">Archived Parking Slots</h3>
              {archivedSlots.length > 0 ? (
                archivedSlots.map((slot) => (
                  <motion.div
                    key={slot.id}
                    variants={itemVariants}
                    className="p-4 bg-purple-50 rounded-xl border border-purple-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-800">Slot {slot.slotNumber}</h4>
                        <p className="text-sm text-slate-500">Archived on {new Date(slot.archivedDate).toLocaleDateString()}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAction('restore', slot)}
                        className="px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-200 transition flex items-center gap-1"
                      >
                        <HiOutlineRefresh className="w-4 h-4" />
                        Restore
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-slate-500">No archived slots</p>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
};

export default AdminCleanupReview;

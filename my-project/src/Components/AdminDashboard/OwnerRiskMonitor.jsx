import { useState, useEffect } from 'react';
import api from '/src/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Admin Dashboard - Owner Risk Monitor
 * Shows all owners with their trust scores and risk levels
 */
const OwnerRiskMonitor = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  useEffect(() => {
    fetchOwnerMetrics();
  }, []);

  const riskOrder = {
    'NO DATA': 0,
    SAFE: 1,
    WARNING: 2,
    'HIGH RISK': 3,
    CRITICAL: 4,
  };

  const fetchOwnerMetrics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/Admin/owners-risk');
      const rows = Array.isArray(response.data) ? response.data : [];
      const normalizedRows = rows
        .map((owner) => ({
          ownerId: owner?.ownerId,
          ownerName: owner?.ownerName || `Owner #${owner?.ownerId ?? ''}`,
          trustScore: Number(owner?.trustScore ?? owner?.score ?? 0),
          riskLevel: owner?.riskLevel || owner?.risk || 'NO DATA',
          totalReviews: Number(owner?.totalReviews ?? 0),
          negativePercent: Number(owner?.negativePercent ?? owner?.negativePercentage ?? 0),
          securityComplaints: Number(owner?.securityComplaints ?? owner?.securityFlags ?? 0),
          trend: owner?.trend || 'Stable',
          suggestedAction: owner?.suggestedAction || 'None',
        }))
        .sort((a, b) => a.trustScore - b.trustScore);

      setOwners(normalizedRows);
      setError(null);
    } catch (err) {
      console.error('Error fetching owner metrics:', err);
      setError('Failed to load owner risk data');
      toast.error('Error loading metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleWarnOwner = async (ownerId) => {
    try {
      await api.post(`/Admin/owners/${ownerId}/warn`);
      toast.success('Owner warned successfully');
    } catch (err) {
      toast.info('Warn Owner endpoint is not available yet.');
    }
  };

  const handleFreezeOwner = async (ownerId) => {
    try {
      await api.post(`/Admin/owners/${ownerId}/freeze`);
      toast.success('Owner listings frozen');
    } catch (err) {
      toast.info('Freeze Listings endpoint is not available yet.');
    }
  };

  const handleRestoreOwner = async (ownerId) => {
    try {
      await api.post(`/Admin/owners/${ownerId}/restore`);
      toast.success('Owner restored');
    } catch (err) {
      toast.info('Restore Owner endpoint is not available yet.');
    }
  };

  const handleViewReviews = async (ownerId) => {
    try {
      await api.get(`/admin/metrics/owner/${ownerId}`);
      toast.success(`Loaded owner ${ownerId} review summary`);
    } catch (err) {
      toast.info('Detailed owner review page is not integrated yet.');
    }
  };

  const filteredOwners = owners
    .filter((owner) => owner.ownerName.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((owner) => (riskFilter === 'ALL' ? true : owner.riskLevel === riskFilter))
    .sort((a, b) => {
      if (a.trustScore !== b.trustScore) {
        return a.trustScore - b.trustScore;
      }
      return (riskOrder[b.riskLevel] ?? 0) - (riskOrder[a.riskLevel] ?? 0);
    });

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'SAFE':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'HIGH RISK':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'NO DATA':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-100 p-4 md:p-8">
      <ToastContainer position="top-center" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Owner Risk Monitor</h1>
          <p className="text-slate-600">Full admin view across all owners with trust, complaints, trend and recommended actions</p>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-rose-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search owner name"
              className="px-4 py-2 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-4 py-2 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="SAFE">SAFE</option>
              <option value="WARNING">WARNING</option>
              <option value="HIGH RISK">HIGH RISK</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="NO DATA">NO DATA</option>
            </select>
            <button
              onClick={fetchOwnerMetrics}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full"></div>
            </div>
            <p className="mt-4 text-slate-600">Loading metrics...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Metrics Table */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-rose-100">
            {filteredOwners.length === 0 ? (
              <div className="p-8 text-center text-slate-600">
                {owners.length === 0 ? 'No owners found in the system.' : 'No owners match the current search/filter.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-rose-100 to-orange-100 border-b border-rose-200">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Owner</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Trust Score</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Risk Level</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Total Reviews</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Negative %</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Security Complaints</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Trend</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Suggested Action</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOwners.map((owner, idx) => (
                      <tr
                        key={owner.ownerId ?? idx}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                      >
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                          {owner.ownerName}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-900">
                            {Number(owner.trustScore ?? 0).toFixed(1)}/100
                          </div>
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full transition-all ${
                                Number(owner.trustScore ?? 0) >= 80
                                  ? 'bg-green-500'
                                  : Number(owner.trustScore ?? 0) >= 60
                                  ? 'bg-yellow-500'
                                  : Number(owner.trustScore ?? 0) >= 40
                                  ? 'bg-orange-500'
                                  : 'bg-red-600'
                              }`}
                              style={{ width: `${Number(owner.trustScore ?? 0)}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRiskColor(owner.riskLevel)}`}>
                            {owner.riskLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900">
                          {Number(owner.totalReviews ?? 0)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-red-700 font-semibold">{Number(owner.negativePercent ?? 0).toFixed(1)}%</div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="text-red-700 font-semibold">{Number(owner.securityComplaints ?? 0)}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {owner.trend}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {owner.suggestedAction}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleViewReviews(owner.ownerId)}
                              className="px-3 py-1 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition text-xs font-semibold"
                            >
                              View Reviews
                            </button>
                            <button
                              onClick={() => handleWarnOwner(owner.ownerId)}
                              className="px-3 py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-xs font-semibold"
                            >
                              Warn Owner
                            </button>
                            <button
                              onClick={() => handleFreezeOwner(owner.ownerId)}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-xs font-semibold"
                            >
                              Freeze Listings
                            </button>
                            <button
                              onClick={() => handleRestoreOwner(owner.ownerId)}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-semibold"
                            >
                              Restore Owner
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Stats Summary */}
        {!loading && owners.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            {[
              { label: 'Total Owners', value: owners.length, color: 'from-blue-500 to-blue-600' },
              {
                label: 'High Risk',
                value: owners.filter(o => o.riskLevel === 'HIGH RISK' || o.riskLevel === 'CRITICAL').length,
                color: 'from-red-500 to-red-600'
              },
              {
                label: 'Avg Trust Score',
                value: (owners.reduce((sum, o) => sum + Number(o.trustScore ?? 0), 0) / owners.length).toFixed(1),
                color: 'from-green-500 to-green-600'
              },
              {
                label: 'Avg Negative %',
                value: `${(owners.reduce((sum, o) => sum + Number(o.negativePercent ?? 0), 0) / owners.length).toFixed(1)}%`,
                color: 'from-purple-500 to-purple-600'
              }
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-lg`}
              >
                <p className="text-sm opacity-90">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerRiskMonitor;

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '/src/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Owner Dashboard - Review Analytics
 * Shows owner's trust score, sentiment analysis, and complaint breakdown
 */
const ReviewAnalytics = () => {
  const location = useLocation();
  const isAdminView = location.pathname.startsWith('/admin/');

  const [metrics, setMetrics] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeMetrics = (data = {}) => ({
    trustScore: Number(data.trustScore ?? 100),
    riskLevel: data.riskLevel || 'LOW',
    averageRating: Number(data.averageRating ?? 0),
    totalReviews: Number(data.totalReviews ?? 0),
    positiveReviews: Number(data.positiveReviews ?? 0),
    neutralReviews: Number(data.neutralReviews ?? 0),
    negativeReviews: Number(data.negativeReviews ?? 0),
    positivePercentage: Number(data.positivePercentage ?? 0),
    neutralPercentage: Number(data.neutralPercentage ?? 0),
    negativePercentage: Number(data.negativePercentage ?? 0),
    securityFlags: Number(data.securityFlags ?? 0),
    cleanlinessFlags: Number(data.cleanlinessFlags ?? 0),
    updatedAt: data.updatedAt || null,
  });

  useEffect(() => {
    fetchAnalytics();
  }, [isAdminView]);

  const normalizePlatformAnalytics = (data = {}) => ({
    totalReviews: Number(data.totalReviews ?? 0),
    positivePercent: Number(data.positivePercent ?? 0),
    negativePercent: Number(data.negativePercent ?? 0),
    neutralPercent: Number(data.neutralPercent ?? 0),
    avgRating: Number(data.avgRating ?? 0),
    topComplaints: Array.isArray(data.topComplaints) ? data.topComplaints : [],
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      if (isAdminView) {
        const response = await api.get('/Admin/review-analytics');
        setPlatform(normalizePlatformAnalytics(response.data));
        setMetrics(null);
      } else {
        const [metricsRes, summaryRes] = await Promise.all([
          api.get('/owner/analytics/my-metrics'),
          api.get('/owner/analytics/summary')
        ]);
        setMetrics(normalizeMetrics({ ...summaryRes.data, ...metricsRes.data }));
        setPlatform(null);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
      toast.error('Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    try {
      if (isAdminView) {
        await fetchAnalytics();
        toast.success('Analytics refreshed successfully');
        return;
      }

      const response = await api.post('/owner/analytics/recalculate');
      setMetrics(normalizeMetrics(response.data));
      toast.success('Score recalculated successfully');
    } catch (err) {
      console.error('Error recalculating score:', err);
      toast.error('Error recalculating score');
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'LOW':
        return 'from-green-500 to-green-600';
      case 'MEDIUM':
        return 'from-yellow-500 to-yellow-600';
      case 'HIGH':
        return 'from-orange-500 to-orange-600';
      case 'CRITICAL':
        return 'from-red-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-100 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full"></div>
          </div>
          <p className="mt-4 text-slate-600">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (error || (!isAdminView && !metrics) || (isAdminView && !platform)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-100 p-4 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-700">{error || 'Failed to load analytics'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-100 p-4 md:p-8">
      <ToastContainer position="top-center" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            {isAdminView ? 'Platform Review Analytics' : 'Review Analytics'}
          </h1>
          <p className="text-slate-600">
            {isAdminView
              ? 'Monitor overall sentiment, ratings and complaint trends across the platform'
              : 'Monitor your parking ratings and customer feedback'}
          </p>
        </div>

        {isAdminView && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Reviews', value: platform.totalReviews, icon: '📊', color: 'from-blue-500 to-blue-600' },
                { label: 'Positive %', value: `${platform.positivePercent.toFixed(1)}%`, icon: '✅', color: 'from-green-500 to-green-600' },
                { label: 'Negative %', value: `${platform.negativePercent.toFixed(1)}%`, icon: '⚠️', color: 'from-red-500 to-red-600' },
                { label: 'Avg Rating', value: platform.avgRating.toFixed(1), icon: '⭐', color: 'from-amber-500 to-orange-600' }
              ].map((stat, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 text-white shadow-md`}>
                  <p className="text-3xl mb-2">{stat.icon}</p>
                  <p className="text-white/80 text-sm">{stat.label}</p>
                  <p className="text-4xl font-bold mt-2">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-xl shadow-md p-8 border border-rose-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Sentiment Breakdown</h2>
                <div className="space-y-6">
                  {[
                    { label: 'Positive', percentage: platform.positivePercent, color: 'bg-green-500' },
                    { label: 'Neutral', percentage: platform.neutralPercent, color: 'bg-yellow-500' },
                    { label: 'Negative', percentage: platform.negativePercent, color: 'bg-red-500' }
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold text-slate-900">{item.label}</span>
                        <span className="font-bold text-slate-700">{item.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-8 border border-rose-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Top Complaint Types</h2>
                {platform.topComplaints.length === 0 ? (
                  <div className="text-slate-600">No complaint categories detected yet.</div>
                ) : (
                  <div className="space-y-3">
                    {platform.topComplaints.map((complaint, idx) => (
                      <div key={complaint + idx} className="bg-rose-50 border border-rose-100 rounded-lg px-4 py-3 text-slate-800 font-medium">
                        {idx + 1}. {complaint}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {platform.totalReviews === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center mb-8">
                <p className="text-amber-800">No review analytics available yet. Data will appear after reviews are submitted.</p>
              </div>
            )}

            <button
              onClick={handleRecalculate}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition"
            >
              Refresh Analytics
            </button>
          </>
        )}

        {!isAdminView && (
          <>

        {/* Trust Score Card */}
        <div className={`bg-gradient-to-br ${getRiskColor(metrics.riskLevel)} rounded-2xl p-8 text-white shadow-lg mb-8`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-white/80 text-sm mb-2">Trust Score</p>
              <p className="text-5xl font-bold">{metrics.trustScore.toFixed(1)}</p>
              <p className="text-white/80 text-xs mt-2">out of 100</p>
            </div>
            <div className="text-center border-l border-r border-white/20">
              <p className="text-white/80 text-sm mb-2">Risk Level</p>
              <p className="text-3xl font-bold">{metrics.riskLevel}</p>
              <p className="text-white/80 text-xs mt-2">Current status</p>
            </div>
            <div className="text-center">
              <p className="text-white/80 text-sm mb-2">Average Rating</p>
              <p className="text-5xl font-bold">{metrics.averageRating.toFixed(1)}</p>
              <p className="text-white/80 text-xs mt-2">from {metrics.totalReviews} reviews</p>
            </div>
          </div>
          <button
            onClick={handleRecalculate}
            className="mt-6 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition"
          >
            Recalculate Score
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Reviews', value: metrics.totalReviews, icon: '📊', color: 'blue' },
            { label: 'Positive Reviews', value: metrics.positiveReviews, icon: '✅', color: 'green' },
            { label: 'Negative Reviews', value: metrics.negativeReviews, icon: '⚠️', color: 'red' },
            { label: 'Neutral Reviews', value: metrics.neutralReviews, icon: '➖', color: 'yellow' }
          ].map((stat, idx) => {
            const colorMap = {
              blue: 'from-blue-500 to-blue-600',
              green: 'from-green-500 to-green-600',
              red: 'from-red-500 to-red-600',
              yellow: 'from-yellow-500 to-yellow-600'
            };
            return (
              <div
                key={idx}
                className={`bg-gradient-to-br ${colorMap[stat.color]} rounded-xl p-6 text-white shadow-md`}
              >
                <p className="text-3xl mb-2">{stat.icon}</p>
                <p className="text-white/80 text-sm">{stat.label}</p>
                <p className="text-4xl font-bold mt-2">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Sentiment Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart Simulation */}
          <div className="bg-white rounded-xl shadow-md p-8 border border-rose-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Sentiment Breakdown</h2>
            <div className="space-y-6">
              {[
                { label: 'Positive', percentage: metrics.positivePercentage, color: 'bg-green-500' },
                { label: 'Neutral', percentage: metrics.neutralPercentage, color: 'bg-yellow-500' },
                { label: 'Negative', percentage: metrics.negativePercentage, color: 'bg-red-500' }
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-slate-900">{item.label}</span>
                    <span className="font-bold text-slate-700">{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issues Breakdown */}
          <div className="bg-white rounded-xl shadow-md p-8 border border-rose-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Reported Issues</h2>
            <div className="space-y-6">
              {[
                {
                  label: 'Security Issues',
                  count: metrics.securityFlags,
                  icon: '🔒',
                  color: 'text-red-600',
                  bgColor: 'bg-red-100'
                },
                {
                  label: 'Cleanliness Issues',
                  count: metrics.cleanlinessFlags,
                  icon: '🧹',
                  color: 'text-orange-600',
                  bgColor: 'bg-orange-100'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`${item.bgColor} ${item.color} rounded-lg p-4 border-l-4 border-current`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-semibold">{item.label}</span>
                    </div>
                    <span className="text-3xl font-bold">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendation */}
        {metrics.riskLevel !== 'LOW' && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-blue-900 mb-2">📋 Recommendations</h3>
            <ul className="text-blue-800 space-y-2">
              {metrics.riskLevel === 'MEDIUM' && (
                <>
                  <li>• Monitor recent negative reviews for common complaints</li>
                  <li>• Consider maintenance improvements if security/cleanliness issues are reported</li>
                </>
              )}
              {metrics.riskLevel === 'HIGH' && (
                <>
                  <li>• Address reported security concerns immediately</li>
                  <li>• Improve parking area maintenance and cleanliness</li>
                  <li>• Review and respond to customer feedback</li>
                </>
              )}
              {metrics.riskLevel === 'CRITICAL' && (
                <>
                  <li>• 🚨 Urgent: Multiple customers reported safety concerns</li>
                  <li>• Increase security measures and maintenance immediately</li>
                  <li>• Consider temporary closure for major improvements</li>
                  <li>• Contact admin support for compliance assistance</li>
                </>
              )}
            </ul>
          </div>
        )}

        {metrics.totalReviews === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <p className="text-amber-800">
              No reviews yet. Once customers complete bookings and submit reviews, your analytics will appear here.
            </p>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-center text-sm text-slate-600 mt-8">
          Last updated: {metrics.updatedAt ? new Date(metrics.updatedAt).toLocaleString() : 'N/A'}
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewAnalytics;

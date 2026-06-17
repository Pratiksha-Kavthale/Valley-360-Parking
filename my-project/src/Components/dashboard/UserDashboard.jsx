import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useNotification } from '../../contexts';
import { DashboardLayout } from '../layouts';
import { Card, StatsCard, Button, Badge, StatusBadge, Spinner } from '../ui';
import { bookingApi } from '../../api/booking.api';
import { parkingApi } from '../../api/parking.api';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

// Navigation items for user dashboard
const userNavItems = [
  {
    path: '/UserDashBoard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: '/ViewSlots',
    label: 'Find Parking',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    path: '/BookParking',
    label: 'Book Parking',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    path: '/UserBookings',
    label: 'My Bookings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    path: '/Profile',
    label: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

const UserDashboardNew = () => {
  const { user } = useAuth();
  const { error: showError } = useNotification();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalSpent: 0,
    savedLocations: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [nearbyAreas, setNearbyAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user bookings
      const userId = user?.id;
      if (userId) {
        const bookings = await bookingApi.getBookingsByUser(userId);
        const activeCount = bookings.filter(b => 
          b.status === 'CONFIRMED' || b.status === 'ACTIVE'
        ).length;
        const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        
        setStats({
          totalBookings: bookings.length,
          activeBookings: activeCount,
          totalSpent: totalSpent,
          savedLocations: 3, // Placeholder
        });
        
        setRecentBookings(bookings.slice(0, 5));
      }

      // Fetch nearby parking areas
      const areas = await parkingApi.getAllAreas();
      setNearbyAreas(areas.slice(0, 4));
      
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      // Don't show error for initial load - might have no data yet
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <DashboardLayout navItems={userNavItems} title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={userNavItems} title="Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}! 👋
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Here's what's happening with your parking today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          changeType="positive"
        />
        <StatsCard
          title="Active Bookings"
          value={stats.activeBookings}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Total Spent"
          value={formatCurrency(stats.totalSpent)}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Saved Locations"
          value={stats.savedLocations}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <Card className="mb-8" padding="md">
        <Card.Header>
          <Card.Title>Quick Actions</Card.Title>
        </Card.Header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/ViewSlots">
            <Button variant="secondary" fullWidth className="flex-col py-6 gap-2">
              <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm">Find Parking</span>
            </Button>
          </Link>
          <Link to="/BookParking">
            <Button variant="secondary" fullWidth className="flex-col py-6 gap-2">
              <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm">Book Now</span>
            </Button>
          </Link>
          <Link to="/BookingQR">
            <Button variant="secondary" fullWidth className="flex-col py-6 gap-2">
              <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span className="text-sm">My QR Code</span>
            </Button>
          </Link>
          <Link to="/ParkingReviews">
            <Button variant="secondary" fullWidth className="flex-col py-6 gap-2">
              <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-sm">Reviews</span>
            </Button>
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <Card padding="md">
          <Card.Header action={
            <Link to="/UserBookings" className="text-sm text-rose-500 hover:text-rose-600 font-medium">
              View All →
            </Link>
          }>
            <Card.Title>Recent Bookings</Card.Title>
          </Card.Header>
          
          {recentBookings.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-slate-500 dark:text-slate-400">No bookings yet</p>
              <Link to="/ViewSlots">
                <Button size="sm" className="mt-4">
                  Find Parking
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900/30 dark:to-orange-900/30 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {booking.parkingSlot?.parkingArea?.name || 'Parking'}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDateTime(booking.startTime)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Nearby Parking Areas */}
        <Card padding="md">
          <Card.Header action={
            <Link to="/ViewSlots" className="text-sm text-rose-500 hover:text-rose-600 font-medium">
              View All →
            </Link>
          }>
            <Card.Title>Nearby Parking</Card.Title>
          </Card.Header>
          
          {nearbyAreas.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <p className="text-slate-500 dark:text-slate-400">No parking areas found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {nearbyAreas.map((area) => (
                <Link
                  key={area.id}
                  to={`/ViewSlots?area=${area.id}`}
                  className="block p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{area.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{area.address}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="success" size="sm">
                          {area.availableSlots || 0} slots free
                        </Badge>
                        <span className="text-sm font-medium text-rose-500">
                          {formatCurrency(area.pricePerHour || 0)}/hr
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium">{area.rating || '4.5'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboardNew;

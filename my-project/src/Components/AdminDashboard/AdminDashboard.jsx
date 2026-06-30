import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '/src/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({
        parkingSlots: 0,
        parkingAreas: 0,
        owners: 0,
        customers: 0,
    });

    useEffect(() => {
        // Define the async function
        const fetchData = async () => {
            try {
                const response = await api.get('http://localhost:8080/Admin/dashboard'); // Make sure this matches your actual endpoint
                setData(response.data);
               
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        // Call the async function
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 px-4 py-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-200 shadow-md p-8 w-full max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-slate-900">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Parking Slots" value={data.parkingSlots} />
                <Card title="Parking Areas" value={data.parkingAreas} />
                <Card title="Owners" value={data.owners} />
                <Card title="Customers" value={data.customers} />
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">AI Review Intelligence</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/owner-risk')}
                        className="text-left bg-gradient-to-br from-rose-500 to-orange-500 text-white rounded-xl p-5 shadow-md hover:shadow-lg hover:scale-[1.01] transition"
                    >
                        <div className="text-xs uppercase tracking-wide opacity-90">Monitoring</div>
                        <div className="text-xl font-bold mt-1">Owner Risk Monitor</div>
                        <p className="mt-2 text-sm text-white/90">View trust score, risk level, negative feedback and security flags for all owners.</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/admin/review-analytics')}
                        className="text-left bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-xl p-5 shadow-md hover:shadow-lg hover:scale-[1.01] transition"
                    >
                        <div className="text-xs uppercase tracking-wide opacity-90">Insights</div>
                        <div className="text-xl font-bold mt-1">Review Analytics</div>
                        <p className="mt-2 text-sm text-white/90">Track platform sentiment, average ratings, and top complaint categories.</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/admin/payment-review')}
                        className="text-left bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-xl p-5 shadow-md hover:shadow-lg hover:scale-[1.01] transition"
                    >
                        <div className="text-xs uppercase tracking-wide opacity-90">Payments</div>
                        <div className="text-xl font-bold mt-1">Payment Review Queue</div>
                        <p className="mt-2 text-sm text-white/90">Verify submitted payment proofs and resolve booking confirmations.</p>
                    </button>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">Platform Operations</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/cleanup-review')}
                        className="text-left bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-5 shadow-md hover:shadow-lg hover:scale-[1.01] transition"
                    >
                        <div className="text-xs uppercase tracking-wide opacity-90">Maintenance</div>
                        <div className="text-xl font-bold mt-1">Cleanup Review</div>
                        <p className="mt-2 text-sm text-white/90">Review inactive areas/slots (45+ days) for archival or deletion.</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/admin/error-tracking')}
                        className="text-left bg-gradient-to-br from-red-600 to-pink-600 text-white rounded-xl p-5 shadow-md hover:shadow-lg hover:scale-[1.01] transition"
                    >
                        <div className="text-xs uppercase tracking-wide opacity-90">System Health</div>
                        <div className="text-xl font-bold mt-1">Error Tracking</div>
                        <p className="mt-2 text-sm text-white/90">Monitor failed requests, exceptions, and slow API performance.</p>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/admin/analytics')}
                        className="text-left bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl p-5 shadow-md hover:shadow-lg hover:scale-[1.01] transition"
                    >
                        <div className="text-xs uppercase tracking-wide opacity-90">Analytics</div>
                        <div className="text-xl font-bold mt-1">Platform Analytics</div>
                        <p className="mt-2 text-sm text-white/90">View utilization, revenue trends, and parking performance metrics.</p>
                    </button>
                </div>
            </div>

            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">Manage</h2>
                <div className="flex flex-wrap gap-4">
                    <Button onClick={() => navigate('/ViewAllParkingSlots')}>Manage Parking Slots</Button>
                    <Button onClick={() => navigate('/ViewParkingArea')}>Manage Parking Areas</Button>
                    <Button onClick={() => navigate('/ViewOwners')}>Manage Owners</Button>
                    <Button onClick={() => navigate('/ViewCustomers')}>Manage Customers</Button>
                    <Button onClick={() => navigate('/ValidateBookingQR')}>Validate Booking QR</Button>
                </div>
            </div>
            </div>
        </div>
    );
};

const Card = ({ title, value }) => (
    <div className="bg-white border border-rose-100 rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
);

const Button = ({ onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        className="bg-rose-500 hover:bg-rose-600 text-white rounded-md py-2 px-4 hover:scale-105 hover:shadow-md transition"
    >
        {children}
    </button>
);

export default AdminDashboard;



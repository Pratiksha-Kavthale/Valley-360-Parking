import { useState, useEffect } from 'react';
import api from '/src/api';

const ViewAllParkingSlots = () => {
    const [parkingSlots, setParkingSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchParkingSlots = async () => {
            try {
                const response = await api.get('http://localhost:8080/parkingSlots/GetAllParkingSlots');
                setParkingSlots(response.data);
            } catch (error) {
                setError('Error fetching parking slots');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchParkingSlots();
    }, []);

    if (loading) return <div className="text-center text-slate-500">Loading...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 p-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-200 shadow-md p-6 w-full max-w-7xl mx-auto space-y-4">
                <h1 className="text-2xl font-semibold text-slate-900 mb-4">Parking Slots</h1>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                        <thead className="bg-rose-50 text-slate-700 text-sm uppercase">
                            <tr>
                                <th className="px-4 py-2 text-left">ID</th>
                                <th className="px-4 py-2 text-left">Vehicle Type</th>
                                <th className="px-4 py-2 text-left">Parking Area ID</th>
                                <th className="px-4 py-2 text-left">Price</th>
                                <th className="px-4 py-2 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(parkingSlots) && parkingSlots.length > 0 ? (
                                parkingSlots.map(slot => (
                                    <tr key={slot.id} className="border-t hover:bg-rose-50">
                                        <td className="px-4 py-2 text-sm text-slate-700">{slot.id}</td>
                                        <td className="px-4 py-2 text-sm text-slate-700">{slot.vehicleType}</td>
                                        <td className="px-4 py-2 text-sm text-slate-700">{slot.parkingId}</td>
                                        <td className="px-4 py-2 text-sm text-slate-700">₹{slot.price}</td>
                                        <td className={`px-4 py-2 text-sm font-medium ${slot.status === 'AVAILABLE' ? 'text-green-600' : 'text-red-600'}`}>
                                            {slot.status}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="border-t">
                                    <td className="px-4 py-4 text-sm text-slate-700" colSpan="5">No parking slots available</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ViewAllParkingSlots;



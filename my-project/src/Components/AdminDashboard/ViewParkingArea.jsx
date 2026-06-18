import { useState, useEffect } from 'react';
import api from '/src/api';

const ViewParkingArea = () => {
  const [parkingAreas, setParkingAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParkingAreas = async () => {
      try {
        const response = await api.get('https://spirited-essence-production.up.railway.app/parkingArea/GetAllParkingArea');
        setParkingAreas(response.data);
      } catch (error) {
        setError('Error fetching parking slots');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchParkingAreas();
  }, []);

  
const handleDelete = async (id) => {
  try {
   await api.delete(`https://spirited-essence-production.up.railway.app/Admin/deleteParkignArea/${id}`);
    setParkingAreas((prevAreas) => prevAreas.filter((area) => area.id !== id));
  } catch (error) {
    console.error('Error deleting parking area:', error);
  }
};
  if (loading) return <div className="text-center text-slate-500">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 p-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-200 shadow-md p-6 w-full max-w-7xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900 mb-4">Parking Areas</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-rose-50 text-slate-700 text-sm uppercase">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Area</th>
                <th className="px-4 py-2 text-left">City</th>
                <th className="px-4 py-2 text-left">Latitude</th>
                <th className="px-4 py-2 text-left">Longitude</th>
                <th className="px-4 py-2 text-left">Pincode</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(parkingAreas) && parkingAreas.length > 0 ? (
                parkingAreas.map((area) => (
                  <tr key={area.id} className="border-t hover:bg-rose-50">
                    <td className="px-4 py-2 text-sm text-slate-700">{area.id}</td>
                    <td className="px-4 py-2 text-sm text-slate-700">{area.area}</td>
                    <td className="px-4 py-2 text-sm text-slate-700">{area.city}</td>
                    <td className="px-4 py-2 text-sm text-slate-700">{area.latitude}</td>
                    <td className="px-4 py-2 text-sm text-slate-700">{area.longitude}</td>
                    <td className="px-4 py-2 text-sm text-slate-700">{area.pincode}</td>
                    <td className={`px-4 py-2 text-sm font-medium ${area.status === 'AVAILABLE' ? 'text-green-600' : 'text-red-600'}`}>
                      {area.status}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-700">
                      <button
                        onClick={() => handleDelete(area.id)}
                        className="px-3 py-1 rounded-md text-white text-sm bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t">
                  <td className="px-4 py-4 text-sm text-slate-700" colSpan="8">No parking areas available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewParkingArea;



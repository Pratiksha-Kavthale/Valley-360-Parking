import { useState } from 'react';
import api from '/src/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from 'react-router-dom';

const ParkingSlotForm = () => {
    const [slotNumber, setSlotNumber] = useState('');
    const [price, setPrice] = useState('');
    const [vehicleType, setVehicleType] = useState('');
    const [status, setStatus] = useState('');
    const [slotNumberError, setSlotNumberError] = useState('');
    const [priceError, setPriceError] = useState('');
    const [vehicleTypeError, setVehicleTypeError] = useState('');
    const [statusError, setStatusError] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    
    // Get areaId from navigation state, or fallback to sessionStorage
    const getAreaId = () => {
        if (location.state?.areaId) {
            return location.state.areaId;
        }
        const parkingArea = sessionStorage.getItem('parkingArea');
        if (parkingArea) {
            try {
                return JSON.parse(parkingArea).id;
            } catch {
                return null;
            }
        }
        return null;
    };
    
    const areaId = getAreaId();

    const validateForm = () => {
        let isValid = true;
        
        if (!slotNumber.trim()) {
            setSlotNumberError('Slot Number is required.');
            isValid = false;
        } else {
            setSlotNumberError('');
        }

        if (!price || price <= 0) {
            setPriceError('Price must be a positive number.');
            isValid = false;
        } else {
            setPriceError('');
        }

        if (!vehicleType) {
            setVehicleTypeError('Vehicle Type is required.');
            isValid = false;
        } else {
            setVehicleTypeError('');
        }

        if (!status) {
            setStatusError('Status is required.');
            isValid = false;
        } else {
            setStatusError('');
        }

        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form inputs
        if (!validateForm()) return;

        if (!areaId) {
            toast.error('Invalid navigation. Please select area again.');
            navigate(-1);
            return;
        }
        
        const token = localStorage.getItem('token');
        console.log('Token:', token); // Debugging token retrieval
        if (!token) {
            toast.error('User is not authenticated. Please log in.');

            return;
        }

        try {
            console.log('Submitting parking slot with data:', { slotNumber, price, vehicleType, status, areaId }); // Debugging form data
            const response = await api.post('https://spirited-essence-production.up.railway.app/parkingSlots/Add', {
                slotNumber,
                price,
                vehicleType,
                status,
                parkingId: Number(areaId),
                }
            );

            if (response.status === 200) {
                toast.success('Parking slot added successfully');
                navigate('/OwnerDashBoard'); // Navigate to home or relevant page
            } else {
                toast.error('Unexpected response status');
                console.error('Response status:', response.status);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Error adding parking slot';
            toast.error(typeof errorMessage === 'string' ? errorMessage : 'Error adding parking slot');
            console.error('Error:', error.response ? error.response.data : error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 flex items-center justify-center px-4 py-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-200 shadow-md p-8 w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-1/2 bg-gradient-to-br from-rose-400 to-orange-300 text-white flex flex-col justify-center items-center text-center p-6">
                    <h2 className="text-3xl font-bold">Add Parking Slot</h2>
                    <p className="mt-3 text-sm sm:text-base text-white/90">Manage and register parking slot details efficiently</p>
                </div>
                <div className="w-full md:w-1/2 p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="slotNumber" className="block text-sm text-slate-600">Slot Number</label>
                        <input
                            type="text"
                            id="slotNumber"
                            value={slotNumber}
                            onChange={(e) => setSlotNumber(e.target.value)}
                            required
                            className={`w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 ${slotNumberError ? 'border-red-500' : ''}`}
                        />
                        {slotNumberError && <p className="text-red-500 text-sm mt-1">{slotNumberError}</p>}
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="price" className="block text-sm text-slate-600">Price</label>
                        <input
                            type="number"
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            className={`w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 ${priceError ? 'border-red-500' : ''}`}
                        />
                        {priceError && <p className="text-red-500 text-sm mt-1">{priceError}</p>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="vehicleType" className="block text-sm text-slate-600">Vehicle Type</label>
                        <select
                            id="vehicleType"
                            value={vehicleType}
                            onChange={(e) => setVehicleType(e.target.value)}
                            required
                            className={`w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 ${vehicleTypeError ? 'border-red-500' : ''}`}
                        >
                            <option value="">Select Vehicle Type</option>
                            <option value="TWO_WHEELER">Two-Wheeler</option>
                            <option value="FOUR_WHEELER">Four-Wheeler</option>
                        </select>
                        {vehicleTypeError && <p className="text-red-500 text-sm mt-1">{vehicleTypeError}</p>}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="status" className="block text-sm text-slate-600">Status</label>
                        <select
                            id="status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            required
                            className={`w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 ${statusError ? 'border-red-500' : ''}`}
                        >
                            <option value="">Select Status</option>
                            <option value="AVAILABLE">Available</option>
                            <option value="NOT_AVAILABLE">Not Available</option>
                        </select>
                        {statusError && <p className="text-red-500 text-sm mt-1">{statusError}</p>}
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-md py-2 hover:scale-105 hover:shadow-md transition"
                        >
                            Add Parking Slot
                        </button>
                    </div>
                </form>
                <ToastContainer position="top-center" />
            </div>
            </div>
        </div>
    );
};

export default ParkingSlotForm;



import React, { useState, useEffect } from 'react';
import api from '/src/api';
import { useNavigate, useParams } from 'react-router-dom';

const BookParking = () => {
  const { slotId } = useParams(); // Get parking slot ID from the URL params
  const navigate = useNavigate();
  console.log('Parking Slot ID:', slotId);

  const [formData, setFormData] = useState({
    bookingDate: '',
    arrivalDate: '',
    departureDate: '',
    vehicleNo: '',
    vehicleType: 'TWO_WHEELER',
    parkingHours: 1,
    price: 0.0,
    customer_id: '',
    parking_slot_id: slotId,
    status: 'RESERVED',
  });

  const [errors, setErrors] = useState({
    bookingDate: '',
    arrivalDate: '',
    departureDate: '',
    vehicleNo: '',
    bookingConflict: '',
  });

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    const userId = user ? JSON.parse(user).id : null;
    console.log(userId);
    if (userId) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        customer_id: userId,
        bookingDate: new Date().toISOString().split('T')[0],
      }));
    }
  }, []);

  const calculatePrice = (hours, vehicleType) => {
    let price = 0;
    if (vehicleType === 'TWO_WHEELER') {
      if (hours <= 1) price = 50;
      else if (hours > 1 && hours <= 3) price = 80;
      else if (hours > 3) price = 120;
    } else if (vehicleType === 'FOUR_WHEELER') {
      if (hours <= 1) price = 100;
      else if (hours > 1 && hours <= 3) price = 160;
      else if (hours > 3) price = 200;
    }
    return price;
  };

  const validateForm = () => {
    const errors = {};

    const bookingDate = new Date(formData.bookingDate);
    const arrivalDate = new Date(formData.arrivalDate);
    const departureDate = new Date(formData.departureDate);
    const now = new Date();

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight for comparison

    if (bookingDate < today) {
      errors.bookingDate = 'Booking date must be today or in the future.';
    }

    if (arrivalDate >= departureDate) {
      errors.arrivalDate = 'Departure time must be after arrival time.';
    }

    if (formData.arrivalDate && arrivalDate < now) {
      errors.arrivalDate = 'Start time cannot be in the past.';
    }

    if (!formData.vehicleNo.trim()) {
      errors.vehicleNo = 'Vehicle number is required.';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors((prev) => ({ ...prev, bookingConflict: '' }));

    if (!validateForm()) {
      return;
    }

    const arrivalDateTime = new Date(formData.arrivalDate);
    const departureDateTime = new Date(formData.departureDate);
    const hours = Math.ceil((departureDateTime - arrivalDateTime) / (1000 * 60 * 60));

    const calculatedPrice = calculatePrice(hours, formData.vehicleType);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('User is not authenticated. Please log in.');
      return;
    }

    try {
      const response = await api.post('http://localhost:8080/booking/add', {
        ...formData,
        parkingHours: hours,
        price: calculatedPrice,
      });

      alert('Booking successful!');
      navigate(`/BookingPayment/${response.data.id}`, {
        state: {
          booking: response.data,
        },
      });
    } catch (error) {
      if (error?.response?.status === 409) {
        const conflictMessage = error?.response?.data?.message || 'Slot already booked for the selected time range.';
        setErrors((prev) => ({ ...prev, bookingConflict: conflictMessage }));
        return;
      }

      const detailedMessage = error?.response?.data?.message || 'Unable to create booking. Please try again.';
      setErrors((prev) => ({ ...prev, bookingConflict: detailedMessage }));
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 flex items-center justify-center px-4 py-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-200 shadow-md p-8 w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-rose-400 to-orange-300 text-white flex flex-col justify-center items-center text-center p-6">
          <h2 className="text-3xl font-bold">Book Parking</h2>
          <p className="mt-3 text-sm sm:text-base text-white/90">Reserve your slot with accurate timing and pricing</p>
        </div>
        <div className="w-full md:w-1/2 p-6">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Book Parking</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.bookingConflict && (
          <p className="text-red-500 text-sm">{errors.bookingConflict}</p>
        )}

        <label htmlFor="bookingDate" className="block text-sm text-slate-600">
          Booking Date:
        </label>
        <input
          type="date"
          id="bookingDate"
          name="bookingDate"
          value={formData.bookingDate}
          onChange={handleChange}
          className={`w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 ${errors.bookingDate ? 'border-red-500' : ''}`}
        />
        {errors.bookingDate && <p className="text-red-500 text-sm mb-4">{errors.bookingDate}</p>}

        <label htmlFor="arrivalDate" className="block text-sm text-slate-600">
          Arrival Date and Time:
        </label>
        <input
          type="datetime-local"
          id="arrivalDate"
          name="arrivalDate"
          value={formData.arrivalDate}
          onChange={handleChange}
          required
          className={`w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 ${errors.arrivalDate ? 'border-red-500' : ''}`}
        />
        {errors.arrivalDate && <p className="text-red-500 text-sm mb-4">{errors.arrivalDate}</p>}

        <label htmlFor="departureDate" className="block text-sm text-slate-600">
          Departure Date and Time:
        </label>
        <input
          type="datetime-local"
          id="departureDate"
          name="departureDate"
          value={formData.departureDate}
          onChange={handleChange}
          required
          className={`w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 ${errors.departureDate ? 'border-red-500' : ''}`}
        />
        {errors.departureDate && <p className="text-red-500 text-sm mb-4">{errors.departureDate}</p>}

        <label htmlFor="vehicleNo" className="block text-sm text-slate-600">
          Vehicle Number:
        </label>
        <input
          type="text"
          id="vehicleNo"
          name="vehicleNo"
          value={formData.vehicleNo}
          onChange={handleChange}
          required
          className={`w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400 ${errors.vehicleNo ? 'border-red-500' : ''}`}
        />
        {errors.vehicleNo && <p className="text-red-500 text-sm mb-4">{errors.vehicleNo}</p>}

        <label htmlFor="vehicleType" className="block text-sm text-slate-600">
          Vehicle Type:
        </label>
        <select
          id="vehicleType"
          name="vehicleType"
          value={formData.vehicleType}
          onChange={handleChange}
          required
          className="w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          <option value="TWO_WHEELER">Two-Wheeler</option>
          <option value="FOUR_WHEELER">Four-Wheeler</option>
        </select>

        <label htmlFor="parkingHours" className="block text-sm text-slate-600">
          Parking Hours:
        </label>
        <input
          type="number"
          id="parkingHours"
          name="parkingHours"
          value={Math.ceil((new Date(formData.departureDate) - new Date(formData.arrivalDate)) / (1000 * 60 * 60))}
          readOnly
          className="w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
        />

        <label htmlFor="price" className="block text-sm text-slate-600">
          Price:
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={calculatePrice(Math.ceil((new Date(formData.departureDate) - new Date(formData.arrivalDate)) / (1000 * 60 * 60)), formData.vehicleType)}
          readOnly
          className="w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
        />

        <button
          type="submit"
          className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-md py-2 hover:scale-105 hover:shadow-md transition"
        >
          Book Now
        </button>
      </form>
    </div>
    </div>
    </div>
  );
};

export default BookParking;



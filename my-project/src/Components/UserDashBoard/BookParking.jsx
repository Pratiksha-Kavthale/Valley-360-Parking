import { useState, useEffect } from 'react';
import api from '/src/api';
import { useNavigate, useParams, Link } from 'react-router-dom';

const BookParking = () => {
  const { slotId } = useParams();
  const navigate = useNavigate();

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

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = sessionStorage.getItem('user');
    const userId = user ? JSON.parse(user).id : null;
    if (userId) {
      setFormData((prev) => ({
        ...prev,
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
    const newErrors = {};
    const bookingDate = new Date(formData.bookingDate);
    const arrivalDate = new Date(formData.arrivalDate);
    const departureDate = new Date(formData.departureDate);
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) newErrors.bookingDate = 'Booking date must be today or in the future.';
    if (arrivalDate >= departureDate) newErrors.arrivalDate = 'Departure time must be after arrival time.';
    if (formData.arrivalDate && arrivalDate < now) newErrors.arrivalDate = 'Start time cannot be in the past.';
    if (!formData.vehicleNo.trim()) newErrors.vehicleNo = 'Vehicle number is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: '', bookingConflict: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors((prev) => ({ ...prev, bookingConflict: '' }));

    if (!validateForm()) return;

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
      setSubmitting(true);
      const response = await api.post('https://spirited-essence-production.up.railway.app/booking/add', {
        ...formData,
        parkingHours: hours,
        price: calculatedPrice,
      });

      navigate(`/BookingPayment/${response.data.id}`, { state: { booking: response.data } });
    } catch (error) {
      const message = error?.response?.data?.message || 'Unable to create booking. Please try again.';
      setErrors((prev) => ({ ...prev, bookingConflict: message }));
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedHours = Math.max(0, Math.ceil((new Date(formData.departureDate) - new Date(formData.arrivalDate)) / (1000 * 60 * 60)));
  const calculatedPrice = calculatePrice(calculatedHours, formData.vehicleType);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/UserDashBoard" className="text-sm text-slate-500 hover:text-rose-500 flex items-center gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-rose-100 p-2.5 text-rose-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Book Parking Slot</h1>
              <p className="text-slate-600">Fill in the details to reserve your spot</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-5">
            <div className="flex items-center gap-3 text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <div>
                <h2 className="font-semibold">Slot #{slotId}</h2>
                <p className="text-white/80 text-sm">Complete your booking</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errors.bookingConflict && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errors.bookingConflict}
              </div>
            )}

            <div>
              <label htmlFor="bookingDate" className="block text-sm font-medium text-slate-700 mb-1.5">
                Booking Date
              </label>
              <input
                type="date"
                id="bookingDate"
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors ${errors.bookingDate ? 'border-red-300' : 'border-slate-200'}`}
              />
              {errors.bookingDate && <p className="text-red-500 text-xs mt-1.5">{errors.bookingDate}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="arrivalDate" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Arrival Time
                </label>
                <input
                  type="datetime-local"
                  id="arrivalDate"
                  name="arrivalDate"
                  value={formData.arrivalDate}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors ${errors.arrivalDate ? 'border-red-300' : 'border-slate-200'}`}
                />
                {errors.arrivalDate && <p className="text-red-500 text-xs mt-1.5">{errors.arrivalDate}</p>}
              </div>
              <div>
                <label htmlFor="departureDate" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Departure Time
                </label>
                <input
                  type="datetime-local"
                  id="departureDate"
                  name="departureDate"
                  value={formData.departureDate}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors ${errors.departureDate ? 'border-red-300' : 'border-slate-200'}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="vehicleNo" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  id="vehicleNo"
                  name="vehicleNo"
                  value={formData.vehicleNo}
                  onChange={handleChange}
                  placeholder="MH 12 AB 1234"
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors ${errors.vehicleNo ? 'border-red-300' : 'border-slate-200'}`}
                />
                {errors.vehicleNo && <p className="text-red-500 text-xs mt-1.5">{errors.vehicleNo}</p>}
              </div>
              <div>
                <label htmlFor="vehicleType" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Vehicle Type
                </label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors appearance-none bg-white"
                >
                  <option value="TWO_WHEELER">Two-Wheeler</option>
                  <option value="FOUR_WHEELER">Four-Wheeler</option>
                </select>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <h3 className="font-medium text-slate-900 mb-3">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Parking Hours</span>
                  <span className="font-medium text-slate-900">{calculatedHours > 0 ? `${calculatedHours} hour(s)` : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle Type</span>
                  <span className="font-medium text-slate-900">{formData.vehicleType === 'TWO_WHEELER' ? 'Two-Wheeler' : 'Four-Wheeler'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="font-medium text-slate-900">Total Price</span>
                  <span className="text-lg font-bold text-rose-600">Rs. {calculatedPrice}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-rose-600 hover:to-orange-600 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Book Now'
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default BookParking;



import {useState} from 'react'
import api from '/src/api';

const BookParking = () => {
    const [formData, setFormData] = useState({
        date: '',
        vehicleNo: '',
        vehicleType: 'CAR',
        parkingHours: 1,
        price: 0.0,
        
      });
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value,
        });
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          await api.post('http://localhost:8080/booking/Book', formData);
          alert('Booking successful!');
        } catch (error) {
          alert('Error during booking');
          console.error(error);
        }
      };
    
      return (
        <div className="min-h-screen bg-gradient-to-br from-rose-100 via-orange-100 to-amber-200 flex items-center justify-center px-4 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-200 shadow-md p-8 w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
          <div className="w-full md:w-1/2 bg-gradient-to-br from-rose-400 to-orange-300 text-white flex flex-col justify-center items-center text-center p-6">
            <h2 className="text-3xl font-bold">Book Parking</h2>
            <p className="mt-3 text-sm sm:text-base text-white/90">Reserve slots with a clean and consistent flow</p>
          </div>
          <div className="w-full md:w-1/2 p-6">
          <h2 className="text-2xl font-bold mb-6">Book Parking</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label htmlFor="date" className="block text-sm text-slate-600">
              Date and Time:
            </label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
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
              className="w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
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
              <option value="TWO_WHEELER">Car</option>
              <option value="TWO_WHEELER">Motorcycle</option>
              
            </select>
            <label htmlFor="parkingHours" className="block text-sm text-slate-600">
              Parking Hours:
            </label>
            <input
              type="number"
              id="parkingHours"
              name="parkingHours"
              value={formData.parkingHours}
              onChange={handleChange}
              required
              className="w-full border border-rose-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            <label htmlFor="price" className="block text-sm text-slate-600">
              Price:
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
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
}

export default BookParking



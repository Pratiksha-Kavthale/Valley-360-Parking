import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, ThemeProvider, NotificationProvider } from './contexts';

// Import components
import Navbar from './Components/Navbar';
import ProfileComponent from './Components/LoginAndRegistation/Update';
import Hero from './Components/Hero/Hero';
import Banner from './Components/Banners/Banner';
import Banner2 from './Components/Banners/Banner2';
import Footer from './Components/Footer/Footer';
import Registation from './Components/LoginAndRegistation/Registation';
import Login1 from './Components/LoginAndRegistation/Login1';
import Login from './Components/LoginAndRegistation/Login';
import LoginAdmin from './Components/LoginAndRegistation/LoginAdmin';
import ParkingSlotForm from './Components/OwnerDashBoard/AddParkingSlot';
import UserDashboard from './Components/UserDashBoard/UserDashBoard';
import ViewSlots from './Components/UserDashBoard/ViewSlots';
import AboutUs from './Components/Hero/AboutUs';
import ContactUs from './Components/Hero/ContactUs';
import BookParking from './Components/UserDashBoard/BookParking';
import Update from './Components/UserDashBoard/UpdateUser';
import Profile from './Components/UserDashBoard/Profile';
import AdminDashboard from './Components/AdminDashboard/AdminDashboard';
import ViewAllParkingSlots from './Components/AdminDashboard/ViewAllParkingSlots';
import ViewParkingArea from './Components/AdminDashboard/ViewParkingArea';
import OwnersList from './Components/AdminDashboard/ViewAllOwners';
import CustomersList from './Components/AdminDashboard/ViewAllCustomers';
import AddParkingArea from './Components/OwnerDashBoard/AddParkingArea';
import UpdateParkingArea from './Components/OwnerDashBoard/UpdateParkingArea';
import OwnerDashboard from './Components/OwnerDashBoard/OwnerDashBoard';
import DeleteUser from './Components/OwnerDashBoard/DeleteUser';
import Logout from './Components/LoginAndRegistation/Logout.jsx';
import Review from './Components/Banners/Review.jsx';
import BookingQR from './Components/UserDashBoard/BookingQR';
import ValidateBookingQR from './Components/AdminDashboard/ValidateBookingQR';
import UserBookings from './Components/UserDashBoard/UserBookings';
import OwnerParkingAreas from './Components/OwnerDashBoard/OwnerParkingAreas';
import OwnerParkingSlots from './Components/OwnerDashBoard/OwnerParkingSlots';
import OwnerSlotTimeline from './Components/OwnerDashBoard/OwnerSlotTimeline';
import ProtectedRoute from './Components/ProtectedRoute';
import OwnerRiskMonitor from './Components/AdminDashboard/OwnerRiskMonitor';
import ReviewAnalytics from './Components/OwnerDashBoard/ReviewAnalytics';
import BookingPayment from './Components/UserDashBoard/BookingPayment';
import PaymentSettings from './Components/OwnerDashBoard/PaymentSettings';
import OwnerPaymentReview from './Components/OwnerDashBoard/PaymentReview';
import AdminPaymentReview from './Components/AdminDashboard/PaymentReview';

// New Professional Components
import { Login as NewLogin, Register as NewRegister } from './components/auth';
import { UserDashboard as NewUserDashboard } from './components/dashboard';


function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <Routes>
        <Route path="/" element={
          <main className='overflow-x-hidden'>
            <Navbar />
            <Hero />
            <Banner />
            <Banner2 />
            <Review></Review>
            <Footer />
          </main>
        } />
        <Route path="/SignUp" element={<Registation />} />
        <Route path="/AddParking" element={<ParkingSlotForm />} />
        <Route path="/UserDashBoard" element={<UserDashboard />} />
        <Route path="/ViewSlots/:parkingId" element={<ViewSlots />} />
        <Route path="/Login1" element={<Login1 />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/LoginAdmin" element={<LoginAdmin />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/ContactUs" element={<ContactUs />} />
        <Route path="/Update" element={<Update />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Admin" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/owner-risk" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><OwnerRiskMonitor /></ProtectedRoute>} />
        <Route path="/admin/review-analytics" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><ReviewAnalytics /></ProtectedRoute>} />
        <Route path="/admin/owner-risk-monitor" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><OwnerRiskMonitor /></ProtectedRoute>} />
        <Route path="/admin/payment-review" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><AdminPaymentReview /></ProtectedRoute>} />
        <Route path="/ViewAllParkingSlots" element={<ViewAllParkingSlots />} />
        <Route path="/ViewParkingArea" element={<ViewParkingArea />} />
        <Route path="/ViewOwners" element={<OwnersList />} />
        <Route path="/ViewCustomers" element={<CustomersList />} />
        <Route path="/ValidateBookingQR" element={<ValidateBookingQR />} />
        <Route path="admin/parking-slots" element={<ViewAllParkingSlots />} />
        <Route path="admin/parking-areas" element={<ViewParkingArea />} />
        <Route path="admin/owners" element={<OwnersList />} />
        <Route path="admin/customers" element={<CustomersList />} />
        <Route path="Update1" element={<ProfileComponent />} />
        <Route path="/AddParkingSlot" element={<ParkingSlotForm />} />
        <Route path="/AddParkingArea" element={<AddParkingArea />} />
        <Route path="OwnerDashBoard" element={<ProtectedRoute allowedRoles={["ROLE_OWNER"]}><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/owner/review-analytics" element={<ProtectedRoute allowedRoles={["ROLE_OWNER"]}><ReviewAnalytics /></ProtectedRoute>} />
        <Route path="/owner/parking-areas" element={<ProtectedRoute allowedRoles={["ROLE_OWNER"]}><OwnerParkingAreas /></ProtectedRoute>} />
        <Route path="/owner/parking-areas/:areaId/slots" element={<ProtectedRoute allowedRoles={["ROLE_OWNER"]}><OwnerParkingSlots /></ProtectedRoute>} />
        <Route path="/owner/add-slot" element={<ProtectedRoute allowedRoles={["ROLE_OWNER"]}><ParkingSlotForm /></ProtectedRoute>} />
        <Route path="/owner/slots/:slotId/timeline" element={<ProtectedRoute allowedRoles={["ROLE_OWNER"]}><OwnerSlotTimeline /></ProtectedRoute>} />
        <Route path="/owner/payment-settings" element={<ProtectedRoute allowedRoles={["ROLE_OWNER"]}><PaymentSettings /></ProtectedRoute>} />
        <Route path="/owner/payment-review" element={<ProtectedRoute allowedRoles={["ROLE_OWNER"]}><OwnerPaymentReview /></ProtectedRoute>} />
        <Route path='Delete/:userid' element={<DeleteUser/>}></Route>
        <Route path='/logout' element={<Logout/>}></Route>
        <Route path="/Book/:slotId" element={<BookParking/>}></Route>
        <Route path="/BookingPayment/:bookingId" element={<ProtectedRoute allowedRoles={["ROLE_CUSTOMER"]}><BookingPayment /></ProtectedRoute>}></Route>
        <Route path="/BookingQR" element={<BookingQR/>}></Route>
        <Route path="/user/bookings" element={<UserBookings/>}></Route>
        <Route path="/admin/validate-qr" element={<ValidateBookingQR/>}></Route>

        {/* New Professional Routes (optional - can replace old ones) */}
        <Route path="/login-new" element={<NewLogin />} />
        <Route path="/register-new" element={<NewRegister />} />
        <Route path="/dashboard-new" element={<NewUserDashboard />} />
      </Routes>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;


import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, ThemeProvider, NotificationProvider } from './contexts';

// Import components
import MainLayout from './Components/layouts/MainLayout';
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
import UserDashboardEnhanced from './Components/UserDashBoard/UserDashBoardEnhanced';
import ViewSlots from './Components/UserDashBoard/ViewSlots';
import AboutUs from './Components/Hero/AboutUs';
import ContactUs from './Components/Hero/ContactUs';
import BookParking from './Components/UserDashBoard/BookParking';
import Update from './Components/UserDashBoard/UpdateUser';
import Profile from './Components/UserDashBoard/Profile';
import AdminDashboard from './Components/AdminDashboard/AdminDashboard';
import AdminDashboardNew from './Components/AdminDashboard/AdminDashboardNew';
import ViewAllParkingSlots from './Components/AdminDashboard/ViewAllParkingSlots';
import ViewParkingArea from './Components/AdminDashboard/ViewParkingArea';
import OwnersList from './Components/AdminDashboard/ViewAllOwners';
import CustomersList from './Components/AdminDashboard/ViewAllCustomers';
import AddParkingArea from './Components/OwnerDashBoard/AddParkingArea';
import OwnerDashboardEnhanced from './Components/OwnerDashBoard/OwnerDashboardEnhanced';
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
import ScrollToTop from './Components/ScrollToTop';
import OwnerRiskMonitor from './Components/AdminDashboard/OwnerRiskMonitor';
import ReviewAnalytics from './Components/OwnerDashBoard/ReviewAnalytics';
import BookingPayment from './Components/UserDashBoard/BookingPayment';
import PaymentSettings from './Components/OwnerDashBoard/PaymentSettings';
import OwnerPaymentReview from './Components/OwnerDashBoard/PaymentReview';
import AdminPaymentReview from './Components/AdminDashboard/PaymentReview';

// New Professional Components
// import { Login as NewLogin } from './components/Auth/Login.jsx';
// import { Register as NewRegister} from './Components/auth/Register'
// import { UserDashboard as NewUserDashboard } from './components/dashboard';


function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <Routes>
        <Route path="/" element={
          <MainLayout>
            <main className='overflow-x-hidden'>
              <Hero />
              <Banner />
              <Banner2 />
              <Review />
              <Footer />
            </main>
          </MainLayout>
        } />
        <Route path="/SignUp" element={<MainLayout><Registation /></MainLayout>} />
        <Route path="/AddParking" element={<MainLayout forceVariant="owner"><ParkingSlotForm /></MainLayout>} />
        <Route path="/UserDashBoard" element={<UserDashboardEnhanced />} />
        <Route path="/UserDashBoard/old" element={<MainLayout forceVariant="user"><UserDashboard /></MainLayout>} />
        <Route path="/ViewSlots/:parkingId" element={<MainLayout forceVariant="user"><ViewSlots /></MainLayout>} />
        <Route path="/Login1" element={<MainLayout><Login1 /></MainLayout>} />
        <Route path="/Login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/LoginAdmin" element={<MainLayout><LoginAdmin /></MainLayout>} />
        <Route path="/AboutUs" element={<MainLayout><AboutUs /></MainLayout>} />
        <Route path="/ContactUs" element={<MainLayout><ContactUs /></MainLayout>} />
        <Route path="/Update" element={<MainLayout forceVariant="user"><Update /></MainLayout>} />
        <Route path="/Profile" element={<MainLayout forceVariant="user"><Profile /></MainLayout>} />
        <Route path="/Admin" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><AdminDashboardNew /></ProtectedRoute>} />
        <Route path="/Admin/old" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><MainLayout forceVariant="admin"><AdminDashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/admin/owner-risk" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><MainLayout forceVariant="admin"><OwnerRiskMonitor /></MainLayout></ProtectedRoute>} />
        <Route path="/admin/review-analytics" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><MainLayout forceVariant="admin"><ReviewAnalytics /></MainLayout></ProtectedRoute>} />
        <Route path="/admin/owner-risk-monitor" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><MainLayout forceVariant="admin"><OwnerRiskMonitor /></MainLayout></ProtectedRoute>} />
        <Route path="/admin/payment-review" element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]}><MainLayout forceVariant="admin"><AdminPaymentReview /></MainLayout></ProtectedRoute>} />
        <Route path="/ViewAllParkingSlots" element={<MainLayout forceVariant="admin"><ViewAllParkingSlots /></MainLayout>} />
        <Route path="/ViewParkingArea" element={<MainLayout forceVariant="admin"><ViewParkingArea /></MainLayout>} />
        <Route path="/ViewOwners" element={<MainLayout forceVariant="admin"><OwnersList /></MainLayout>} />
        <Route path="/ViewCustomers" element={<MainLayout forceVariant="admin"><CustomersList /></MainLayout>} />
        <Route path="/ValidateBookingQR" element={<MainLayout forceVariant="admin"><ValidateBookingQR /></MainLayout>} />
        <Route path="admin/parking-slots" element={<MainLayout forceVariant="admin"><ViewAllParkingSlots /></MainLayout>} />
        <Route path="admin/parking-areas" element={<MainLayout forceVariant="admin"><ViewParkingArea /></MainLayout>} />
        <Route path="admin/owners" element={<MainLayout forceVariant="admin"><OwnersList /></MainLayout>} />
        <Route path="admin/customers" element={<MainLayout forceVariant="admin"><CustomersList /></MainLayout>} />
        <Route path="Update1" element={<MainLayout><ProfileComponent /></MainLayout>} />
        <Route path="/AddParkingSlot" element={<MainLayout forceVariant="owner"><ParkingSlotForm /></MainLayout>} />
        <Route path="/AddParkingArea" element={<MainLayout forceVariant="owner"><AddParkingArea /></MainLayout>} />
        <Route path="OwnerDashBoard" element={<ProtectedRoute allowedRoles={["ROLE_OWNER"]}><MainLayout forceVariant="owner"><OwnerDashboardEnhanced /></MainLayout></ProtectedRoute>} />
        <Route path="/owner/review-analytics" element={<ProtectedRoute allowedRoles={["ROLE_OWNER"]}><MainLayout forceVariant="owner"><ReviewAnalytics /></MainLayout></ProtectedRoute>} />
        <Route path="/owner/parking-areas" element={<ProtectedRoute allowedRoles={["ROLE_OWNER"]}><MainLayout forceVariant="owner"><OwnerParkingAreas /></MainLayout></ProtectedRoute>} />
        <Route path="/owner/parking-areas/:areaId/slots" element={<ProtectedRoute allowedRoles={["ROLE_OWNER"]}><MainLayout forceVariant="owner"><OwnerParkingSlots /></MainLayout></ProtectedRoute>} />
        <Route path="/owner/add-slot" element={<ProtectedRoute allowedRoles={["ROLE_OWNER"]}><MainLayout forceVariant="owner"><ParkingSlotForm /></MainLayout></ProtectedRoute>} />
        <Route path="/owner/slots/:slotId/timeline" element={<ProtectedRoute allowedRoles={["ROLE_OWNER"]}><MainLayout forceVariant="owner"><OwnerSlotTimeline /></MainLayout></ProtectedRoute>} />
        <Route path="/owner/payment-settings" element={<ProtectedRoute allowedRoles={["ROLE_OWNER"]}><MainLayout forceVariant="owner"><PaymentSettings /></MainLayout></ProtectedRoute>} />
        <Route path="/owner/payment-review" element={<ProtectedRoute allowedRoles={["ROLE_OWNER"]}><MainLayout forceVariant="owner"><OwnerPaymentReview /></MainLayout></ProtectedRoute>} />
        <Route path='Delete/:userid' element={<MainLayout><DeleteUser/></MainLayout>}></Route>
        <Route path='/logout' element={<MainLayout><Logout/></MainLayout>}></Route>
        <Route path="/Book/:slotId" element={<MainLayout forceVariant="user"><BookParking/></MainLayout>}></Route>
        <Route path="/BookingPayment/:bookingId" element={<ProtectedRoute allowedRoles={["ROLE_CUSTOMER"]}><MainLayout forceVariant="user"><BookingPayment /></MainLayout></ProtectedRoute>}></Route>
        <Route path="/BookingQR" element={<MainLayout forceVariant="user"><BookingQR/></MainLayout>}></Route>
        <Route path="/user/bookings" element={<MainLayout forceVariant="user"><UserBookings/></MainLayout>}></Route>
        <Route path="/admin/validate-qr" element={<MainLayout forceVariant="admin"><ValidateBookingQR/></MainLayout>}></Route>

        {/* New Professional Routes (optional - can replace old ones) */}
        {/* <Route path="/login-new" element={<MainLayout><NewLogin /></MainLayout>} />
        <Route path="/register-new" element={<MainLayout><NewRegister /></MainLayout>} />
        <Route path="/dashboard-new" element={<MainLayout forceVariant="user"><NewUserDashboard /></MainLayout>} /> */}
      </Routes>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;


import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import LocationSelection from './pages/LocationSelection';
import Schemes from './pages/Schemes';
import Order from './pages/Order';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import OrderHistory from './pages/OrderHistory';
import UserProfile from './pages/UserProfile';
import Cart from './pages/Cart';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/location" element={<LocationSelection />} />
          <Route path="/schemes" element={<Schemes />} />
          <Route path="/order" element={<Order />} />
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/register" element={<UserRegister />} />
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/my-orders" element={<OrderHistory />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

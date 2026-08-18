import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Features from './pages/Features.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';
import Register from './pages/auth/Register.jsx';
import Login from './pages/auth/Login.jsx';
import VerifyIdentity from './pages/auth/VerifyIdentity.jsx';
import VerifyRegistrationOtp from './pages/auth/VerifyRegistrationOtp.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import VerifyResetOtp from './pages/auth/VerifyResetOtp.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';

import Welcome from './pages/Welcome.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Notifications from './pages/Notifications.jsx';
import MealPlanner from './pages/MealPlanner.jsx';
import Settings from './pages/settings/Settings.jsx';

import InventoryList from './pages/inventory/InventoryList.jsx';
import ItemDetails from './pages/inventory/ItemDetails.jsx';

import BrowseDonations from './pages/donations/BrowseDonations.jsx';
import DonationDetails from './pages/donations/DonationDetails.jsx';
import FoodAnalytics from './pages/FoodAnalytics.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/contact" element={<Contact />} />

      {/* Public / auth routes (UC1) */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-identity" element={<VerifyIdentity />} />
      <Route path="/verify-registration-otp" element={<VerifyRegistrationOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Authenticated app routes */}
      <Route
        path="/welcome"
        element={
          <ProtectedRoute>
            <Welcome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <InventoryList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/:id"
        element={
          <ProtectedRoute>
            <ItemDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donations"
        element={
          <ProtectedRoute>
            <BrowseDonations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/donations/:id"
        element={
          <ProtectedRoute>
            <DonationDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <FoodAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/meal-planner"
        element={
          <ProtectedRoute>
            <MealPlanner />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

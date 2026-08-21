import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import Home from './Pages/Home.jsx';
import About from './Pages/About.jsx';
import Features from './Pages/Features.jsx';
import HowItWorks from './Pages/HowItWorks.jsx';
import Contact from './Pages/Contact.jsx';
import NotFound from './Pages/NotFound.jsx';

import Register from './Pages/auth/Register.jsx';
import Login from './Pages/auth/Login.jsx';
import VerifyIdentity from './Pages/auth/VerifyIdentity.jsx';
import VerifyRegistrationOtp from './Pages/auth/VerifyRegistrationOtp.jsx';
import ForgotPassword from './Pages/auth/ForgotPassword.jsx';
import VerifyResetOtp from './Pages/auth/VerifyResetOtp.jsx';
import ResetPassword from './Pages/auth/ResetPassword.jsx';

import Welcome from './Pages/Welcome.jsx';
import Dashboard from './Pages/Dashboard.jsx';
import Notifications from './Pages/Notifications.jsx';
import MealPlanner from './Pages/MealPlanner.jsx';
import Settings from './Pages/settings/Settings.jsx';

import InventoryList from './Pages/inventory/InventoryList.jsx';
import ItemDetails from './Pages/inventory/ItemDetails.jsx';

import BrowseDonations from './Pages/donations/BrowseDonations.jsx';
import DonationDetails from './Pages/donations/DonationDetails.jsx';
import FoodAnalytics from './Pages/FoodAnalytics.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/contact" element={<Contact />} />

      {/* Public / auth routes */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-identity" element={<VerifyIdentity />} />
      <Route
        path="/verify-registration-otp"
        element={<VerifyRegistrationOtp />}
      />
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
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

// =========================
// Public Pages - src/pages
// =========================
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Features from './pages/Features.jsx';
import HowItWorks from './pages/HowItWorks.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

// =========================
// Authentication - src/pages/auth
// =========================
import Register from './pages/auth/Register.jsx';
import Login from './pages/auth/Login.jsx';
import VerifyIdentity from './pages/auth/VerifyIdentity.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';

// =========================
// OTP Verification - src/Pages/auth
// =========================
import VerifyRegistrationOtp from './Pages/auth/VerifyRegistrationOtp.jsx';
import VerifyResetOtp from './Pages/auth/verifyResetOtp.jsx';

// =========================
// Main Application Pages - src/pages
// =========================
import Welcome from './pages/Welcome.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Notifications from './pages/Notifications.jsx';

// =========================
// Meal Planner & Analytics - src/Pages
// =========================
import MealPlanner from './Pages/MealPlanner.jsx';
import FoodAnalytics from './Pages/FoodAnalytics.jsx';

// =========================
// Settings - src/pages/settings
// =========================
import Settings from './pages/settings/Settings.jsx';

// =========================
// Inventory - src/pages/inventory
// =========================
import InventoryList from './pages/inventory/InventoryList.jsx';
import ItemDetails from './pages/inventory/ItemDetails.jsx';

// =========================
// Donations - src/pages/donations
// =========================
import BrowseDonations from './pages/donations/BrowseDonations.jsx';
import DonationDetails from './pages/donations/DonationDetails.jsx';

export default function App() {
  return (
    <Routes>

      {/* =========================
          Public Landing Pages
          ========================= */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/features" element={<Features />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/contact" element={<Contact />} />

      {/* =========================
          Authentication Routes
          ========================= */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-identity" element={<VerifyIdentity />} />

      <Route
        path="/verify-registration-otp"
        element={<VerifyRegistrationOtp />}
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/verify-reset-otp"
        element={<VerifyResetOtp />}
      />

      <Route path="/reset-password" element={<ResetPassword />} />

      {/* =========================
          Protected Routes
          ========================= */}

      {/* Welcome */}
      <Route
        path="/welcome"
        element={
          <ProtectedRoute>
            <Welcome />
          </ProtectedRoute>
        }
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Inventory */}
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

      {/* Donations */}
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

      {/* Food Analytics */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <FoodAnalytics />
          </ProtectedRoute>
        }
      />

      {/* Meal Planner */}
      <Route
        path="/meal-planner"
        element={
          <ProtectedRoute>
            <MealPlanner />
          </ProtectedRoute>
        }
      />

      {/* Notifications */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      {/* Settings */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* =========================
          404 Page
          ========================= */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}
import { Route } from "react-router-dom";

import RegisterBusiness from "../pages/RegisterBusiness";
import RegistrationGateway from "../pages/RegistrationGateway";
import Profile from "../pages/Profile";
import Dashboard from "../pages/business/Dashboard";
import Booking from "../pages/Booking";
import CleaningBooking from "../pages/CleaningBooking";

import Overview from "../pages/owner/Overview";
import AddService from "../pages/owner/AddService";
import Bookings from "../pages/owner/Bookings";
import Analytics from "../pages/owner/Analytics";
import BusinessHours from "../pages/owner/BusinessHours";
import Departments from "../pages/owner/Departments";
import EditBusiness from "../pages/owner/EditBusiness";
import Employees from "../pages/owner/Employees";
import Gallery from "../pages/owner/Gallery";
import Reviews from "../pages/owner/Reviews";
import Settings from "../pages/owner/Settings";
import Subscription from "../pages/owner/Subscription";
import MembershipPlans from "../pages/owner/MembershipPlans";

import ProtectedRoute from "../core/auth/ProtectedRoute";

export function businessRoutes() {
  return (
    <>
      {/* USER PROFILE */}

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      {/* BUSINESS REGISTRATION */}

      <Route
        path="/register-business"
        element={<RegistrationGateway />}
      />

      <Route
        path="/register-business/form"
        element={
          <ProtectedRoute>
            <RegisterBusiness />
          </ProtectedRoute>
        }
      />

      {/* CUSTOMER BOOKING */}

      <Route
        path="/booking"
        element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        }
      />

      <Route
        path="/cleaning-booking"
        element={
          <ProtectedRoute>
            <CleaningBooking />
          </ProtectedRoute>
        }
      />

      {/* BUSINESS DASHBOARD */}

      <Route
        path="/business-dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* OWNER DASHBOARD */}

      <Route
        path="/business-dashboard/overview"
        element={
          <ProtectedRoute>
            <Overview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/business-dashboard/bookings"
        element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/business-dashboard/services"
        element={
          <ProtectedRoute>
            <AddService />
          </ProtectedRoute>
        }
      />

      <Route
        path="/business-dashboard/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/business-dashboard/hours"
        element={
          <ProtectedRoute>
            <BusinessHours />
          </ProtectedRoute>
        }
      />

      <Route
        path="/business-dashboard/departments"
        element={
          <ProtectedRoute>
            <Departments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/business-dashboard/profile"
        element={
          <ProtectedRoute>
            <EditBusiness />
          </ProtectedRoute>
        }
      />

      <Route
        path="/business-dashboard/employees"
        element={
          <ProtectedRoute>
            <Employees />
          </ProtectedRoute>
        }
      />

      <Route
        path="/business-dashboard/gallery"
        element={
          <ProtectedRoute>
            <Gallery />
          </ProtectedRoute>
        }
      />

      <Route
        path="/business-dashboard/reviews"
        element={
          <ProtectedRoute>
            <Reviews />
          </ProtectedRoute>
        }
      />

      <Route
        path="/business-dashboard/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/business-dashboard/subscription"
        element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/business-dashboard/membership-plans"
        element={
          <ProtectedRoute>
            <MembershipPlans />
          </ProtectedRoute>
        }
      />
    </>
  );
}



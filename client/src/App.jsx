import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BookAppointment from "./pages/BookAppointment";
import Dashboard from "./pages/Dashboard";
import StaffDashboard from "./pages/StaffDashboard";
import Login from "./pages/Login";
import AdminUsers from "./pages/AdminUsers";
import Appointments from "./pages/Appointments";
import SidebarLayout from "./components/SidebarLayout";
import StaffLayout from "./components/StaffLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Reports from "./pages/Reports";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorAvailability from "./pages/DoctorAvailability";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BookAppointment />} />
        <Route path="/login" element={<Login />} />

        {/* 👑 Admin routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <SidebarLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/reports" element={<Reports />} />
        </Route>

        {/* 👨‍💼 Staff routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["staff", "admin"]}>
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/appointments" element={<Appointments />} />
        </Route>

        {/* Doctor routes */}
        <Route
          path="/doctor/dashboard"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/availability"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorAvailability />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

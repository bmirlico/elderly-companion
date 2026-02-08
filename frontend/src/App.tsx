import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Action from "./pages/Action";
import ElderSetup from "./pages/ElderSetup";
import ElderHome from "./pages/ElderHome";
import Index from "./pages/Index";
import Reports from "./pages/Reports";
import Resources from "./pages/Resources";
import Profile from "./pages/Profile";
import PersonalProfile from "./pages/PersonalProfile";
import CaringSettings from "./pages/CaringSettings";
import Notifications from "./pages/Notifications";
import HelpSupport from "./pages/HelpSupport";
import Companion from "./pages/Companion";
import Privacy from "./pages/Privacy";
import EmergencyContacts from "./pages/EmergencyContacts";
import MedicationSchedule from "./pages/MedicationSchedule";
import NearbyServices from "./pages/NearbyServices";
import WellnessTips from "./pages/WellnessTips";
import NotFound from "./pages/NotFound";
import { getStoredToken } from "@/api/client";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  if (!getStoredToken()) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ children }: { children: React.ReactElement }) {
  if (getStoredToken()) return <Navigate to="/" replace />;
  return children;
}

const CAREGIVER_PATHS = ["/", "/reports", "/resources", "/profile", "/action"];

function AppLayout() {
  const location = useLocation();
  const showNav = CAREGIVER_PATHS.includes(location.pathname);

  return (
    <>
      <Routes>
        {/* Public routes — redirect to home if already logged in */}
        <Route path="/welcome" element={<GuestRoute><Welcome /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />

        {/* Protected routes — redirect to login if not authenticated */}
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/action" element={<ProtectedRoute><Action /></ProtectedRoute>} />
        <Route path="/elder-setup" element={<ProtectedRoute><ElderSetup /></ProtectedRoute>} />
        <Route path="/elder-home" element={<ProtectedRoute><ElderHome /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/personal-profile" element={<ProtectedRoute><PersonalProfile /></ProtectedRoute>} />
        <Route path="/caring-settings" element={<ProtectedRoute><CaringSettings /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/help-support" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
        <Route path="/companion" element={<ProtectedRoute><Companion /></ProtectedRoute>} />
        <Route path="/privacy" element={<ProtectedRoute><Privacy /></ProtectedRoute>} />
        <Route path="/emergency-contacts" element={<ProtectedRoute><EmergencyContacts /></ProtectedRoute>} />
        <Route path="/medication-schedule" element={<ProtectedRoute><MedicationSchedule /></ProtectedRoute>} />
        <Route path="/nearby-services" element={<ProtectedRoute><NearbyServices /></ProtectedRoute>} />
        <Route path="/wellness-tips" element={<ProtectedRoute><WellnessTips /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

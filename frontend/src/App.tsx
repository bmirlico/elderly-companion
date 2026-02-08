import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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

const queryClient = new QueryClient();

const CAREGIVER_PATHS = ["/", "/reports", "/resources", "/profile", "/action"];

function AppLayout() {
  const location = useLocation();
  const showNav = CAREGIVER_PATHS.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/action" element={<Action />} />
        <Route path="/elder-setup" element={<ElderSetup />} />
        <Route path="/elder-home" element={<ElderHome />} />
        <Route path="/" element={<Index />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/personal-profile" element={<PersonalProfile />} />
        <Route path="/caring-settings" element={<CaringSettings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/help-support" element={<HelpSupport />} />
        <Route path="/companion" element={<Companion />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/emergency-contacts" element={<EmergencyContacts />} />
        <Route path="/medication-schedule" element={<MedicationSchedule />} />
        <Route path="/nearby-services" element={<NearbyServices />} />
        <Route path="/wellness-tips" element={<WellnessTips />} />
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

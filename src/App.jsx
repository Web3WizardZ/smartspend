import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

import AppShell from './components/shared/AppShell';
import Spend from './pages/Spend';
import AmountInput from './pages/AmountInput';
import Result from './pages/Result';
import CompareOptions from './pages/CompareOptions';
import Wallet from './pages/Wallet';
import AddPaymentProfile from './pages/AddPaymentProfile';
import AddLoyaltyCard from './pages/AddLoyaltyCard';
import Savings from './pages/Savings';
import Compare from './pages/Compare';
import Profile from './pages/Profile';
import SmartSpendPlus from './pages/SmartSpendPlus';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRetailers from './pages/admin/AdminRetailers';
import AdminProgrammes from './pages/admin/AdminProgrammes';
import AdminRules from './pages/admin/AdminRules';
import GoodDollarActivation from './pages/GoodDollarActivation';
import Campaigns from './pages/Campaigns';
import { GoodDollarProvider } from './context/GoodDollarContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <img src="https://media.base44.com/images/public/user_69ea57333f824d48a1afdd12/e7314e200_image.png" alt="SmartSpend" className="w-14 h-14 rounded-2xl animate-pulse" />
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    // auth_required and other errors: allow guest access, individual pages handle it
  }

  return (
    <Routes>
      {/* Main app with bottom nav */}
      <Route element={<AppShell />}>
        <Route path="/" element={<Spend />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/savings" element={<Savings />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Sub-screens without bottom nav */}
      <Route path="/amount" element={<AmountInput />} />
      <Route path="/result" element={<Result />} />
      <Route path="/compare-options" element={<CompareOptions />} />
      <Route path="/add-payment-profile" element={<AddPaymentProfile />} />
      <Route path="/add-loyalty-card" element={<AddLoyaltyCard />} />
      <Route path="/smartspend-plus" element={<SmartSpendPlus />} />
      <Route path="/gooddollar-activation" element={<GoodDollarActivation />} />
      <Route path="/campaigns" element={<Campaigns />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/retailers" element={<AdminRetailers />} />
      <Route path="/admin/programmes" element={<AdminProgrammes />} />
      <Route path="/admin/rules" element={<AdminRules />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <GoodDollarProvider>
            <AuthenticatedApp />
          </GoodDollarProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
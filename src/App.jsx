import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ThemeProvider } from '@/lib/theme';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import AddExpense from '@/pages/AddExpense';
import AddIncome from '@/pages/AddIncome';
import History from '@/pages/History';
import Import from '@/pages/Import';
import Months from '@/pages/Months';
import Categories from '@/pages/Categories';
import Settings from '@/pages/Settings';
import Pay from '@/pages/Pay';
import Bills from '@/pages/Bills';
import Savings from '@/pages/Savings';
import BookLayout from '@/components/book/BookLayout';
import BookHome from '@/pages/book/BookHome';
import ClientCard from '@/pages/book/ClientCard';
import AddVisit from '@/pages/book/AddVisit';
import OwnerDashboard from '@/pages/book/OwnerDashboard';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddExpense />} />
          <Route path="/add-income" element={<AddIncome />} />
          <Route path="/history" element={<History />} />
          <Route path="/import" element={<Import />} />
          <Route path="/months" element={<Months />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pay" element={<Pay />} />
          <Route path="/bills" element={<Bills />} />
          <Route path="/savings" element={<Savings />} />
        </Route>
        <Route path="/book" element={<BookLayout />}>
          <Route index element={<BookHome />} />
          <Route path="client/:id" element={<ClientCard />} />
          <Route path="add-visit" element={<AddVisit />} />
          <Route path="dashboard" element={<OwnerDashboard />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
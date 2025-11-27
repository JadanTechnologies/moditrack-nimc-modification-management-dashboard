import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './lib/auth';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AppLayout } from '@/components/layout/AppLayout';
function ProtectedRoutes() {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [user, navigate, location]);
  return user ? (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ) : null; // or a loading spinner
}
export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="moditrack-theme">
      <Outlet />
      <Toaster />
    </ThemeProvider>
  );
}
export { ProtectedRoutes };
import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage';
import { RequestDetailsPage } from '@/pages/RequestDetailsPage';
import { UserManagementPage } from '@/pages/UserManagementPage';
import { AuditTrailPage } from '@/pages/AuditTrailPage';
import { NewRequestPage } from '@/pages/NewRequestPage';
import { App, ProtectedRoutes } from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        element: <ProtectedRoutes />,
        children: [
          {
            path: "/",
            element: <HomePage />,
          },
          {
            path: "/requests/new",
            element: <NewRequestPage />,
          },
          {
            path: "/requests/:id",
            element: <RequestDetailsPage />,
          },
          {
            path: "/users",
            element: <UserManagementPage />,
          },
          {
            path: "/audit",
            element: <AuditTrailPage />,
          },
        ],
      },
    ],
  },
]);
// Do not touch this code
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
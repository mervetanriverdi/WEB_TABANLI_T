import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import AdminCommentsPage from './pages/admin/AdminComments';
import AdminEventsPage from './pages/admin/AdminEvents';
import AdminRegistrationsPage from './pages/admin/AdminRegistrations';
import AdminTagsPage from './pages/admin/AdminTags';
import AdminUsersPage from './pages/admin/AdminUsers';
import EventDetailPage from './pages/EventDetail';
import EventsPage from './pages/Events';
import LoginPage from './pages/Login';
import MyRegistrationsPage from './pages/MyRegistrations';
import RegisterPage from './pages/Register';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <EventsPage /> },
      { path: '/events', element: <EventsPage /> },
      { path: '/events/:id', element: <EventDetailPage /> },
      { path: '/my-registrations', element: <MyRegistrationsPage /> },
    ],
  },
  {
    element: (
      <AdminRoute>
        <AppLayout />
      </AdminRoute>
    ),
    children: [
      { path: '/admin/events', element: <AdminEventsPage /> },
      { path: '/admin/tags', element: <AdminTagsPage /> },
      { path: '/admin/users', element: <AdminUsersPage /> },
      { path: '/admin/registrations', element: <AdminRegistrationsPage /> },
      { path: '/admin/comments', element: <AdminCommentsPage /> },
    ],
  },
]);

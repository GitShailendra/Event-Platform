// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/Home/HomePage';
import EventPage from './pages/Events/EventsPage'
import AboutPage from './pages/About/AboutPage';
import ContactPage from './pages/contact/ContactPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import UserLayout from './pages/user/UserLayout';
import Dashboard from './pages/user/UserDashboard';
import PastEvents from './pages/user/PastEvents';
import Profile from './pages/user/Profile';
import UpcomingEvents from './pages/user/PastEvents'
import Favorites from './pages/user/UserFavourites';
import Tickets from './pages/user/UserTickets';
import OrganizerDashboardLayout from './pages/organizer/OrganizerDashboardLayout';
import OrganizerDashboardOverview from './pages/organizer/OrganizerDashboardOverview';
import OrganizerEvents from './pages/organizer/OrganizerEvents';
import OrganizerEarnings from './pages/organizer/OrganizerEarnings';
import ProtectedRoute from './components/ProtectedRoutes';
import EventDetailsPage from './pages/Events/EventsDetailsPage';
import { AuthProvider } from './context/AuthContext';
import './App.css';

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App bg-black min-h-screen flex flex-col">
          <Routes>
            {/* Public routes with Navbar and Footer */}
            <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/events" element={<PublicLayout><EventPage /></PublicLayout>} />
            <Route path="/events/:id" element={<ProtectedRoute><EventDetailsPage /></ProtectedRoute>} />
            <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
            <Route path="/signup" element={<PublicLayout><SignupPage /></PublicLayout>} />

            {/* User Dashboard Routes (protected) */}
            <Route
              path="/user"
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="upcoming-events" element={<UpcomingEvents />} />
              <Route path="past-events" element={<PastEvents />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Organizer Dashboard Routes (protected) */}
            <Route
              path="/organizer"
              element={
                <ProtectedRoute allowedRoles={['organizer']}>
                  <OrganizerDashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OrganizerDashboardOverview />} />
              <Route path="dashboard" element={<OrganizerDashboardOverview />} />
              <Route path="events" element={<OrganizerEvents />} />
              <Route path="earnings" element={<OrganizerEarnings />} />
              <Route
                path="analytics"
                element={
                  <div className="text-center py-16">
                    <h2 className="text-white text-2xl">Analytics - Coming Soon!</h2>
                  </div>
                }
              />
              <Route
                path="profile"
                element={
                  <div className="text-center py-16">
                    <h2 className="text-white text-2xl">Organizer Profile - Coming Soon!</h2>
                  </div>
                }
              />
            </Route>

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-black flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
                    <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
                    <a href="/" className="btn-primary">Go Home</a>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

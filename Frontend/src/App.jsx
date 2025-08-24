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
import UserDashboardPage from './pages/user/UserDashboard';
function App() {
  const user = null; // Mock user - replace with actual auth context later

  return (
    <Router>
      <div className="App bg-black min-h-screen flex flex-col">
        <Navbar user={user} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path='/user-dashboard' element={<UserDashboardPage/>}/>
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;

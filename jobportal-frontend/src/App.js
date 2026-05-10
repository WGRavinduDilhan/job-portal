import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useEffect, useState } from 'react';
import NavBar from './components/NavBar';
import Auth from './pages/auth/Auth';
import Verification from './pages/verification/Verification';
import Dashboard from './pages/applicant/Dashboard';
import JobList from './pages/applicant/JobList';
import JobDetail from './pages/applicant/JobDetail';
import MyApplications from './pages/applicant/MyApplications';
import CompanyDashboard from './pages/company/CompanyDashboard';
import PostJob from './pages/company/PostJob';
import ApplicantPipeline from './pages/company/ApplicantPipeline';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('ACCESS_TOKEN'));

  useEffect(() => {
    const handler = () => setIsLoggedIn(!!localStorage.getItem('ACCESS_TOKEN'));
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      {isLoggedIn && <NavBar />}
      <Routes>
        <Route path="/"                 element={<Auth />} />
        <Route path="/auth"             element={<Auth />} />
        <Route path="/register-complete" element={<Verification />} />

        <Route path="/dashboard"        element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/jobs"             element={<ProtectedRoute><JobList /></ProtectedRoute>} />
        <Route path="/jobs/:id"         element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
        <Route path="/my-applications"  element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />

        <Route path="/company/dashboard" element={<ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
        <Route path="/company/post-job"  element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
        <Route path="/company/pipeline/:jobId" element={<ProtectedRoute><ApplicantPipeline /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;

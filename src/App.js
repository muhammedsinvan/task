import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import UserManagement from './Pages/UserManagement/UserManagement';
import Layout from './Components/Layout/Layout';
import ProtectedRoute from './Components/ProtectedRoute';

function App() {
  // Function to check if user is already authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  };

  return (
    <Router>
      <Routes>
        {/* Login route - redirect to dashboard if already logged in */}
        <Route path="/login" element={
          isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="user-management" element={<UserManagement />} />
        </Route>
        
        {/* Redirect any unknown routes */}
        <Route path="*" element={
          isAuthenticated() ? 
            <Navigate to="/dashboard" replace /> : 
            <Navigate to="/login" replace />
        } />
      </Routes>
    </Router>
  );
}

export default App;
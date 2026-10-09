import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', color: '#f8fafc', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '2rem', margin: '0 0 10px 0' }}>Access Denied</h1>
        <p style={{ color: '#94a3b8' }}>You do not have administrator privileges.</p>
        <button 
          onClick={() => window.location.href = '/login'} 
          style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
        >
          Return to Login
        </button>
      </div>
    );
  }

  return children;
}

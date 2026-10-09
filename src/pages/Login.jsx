import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../store/authSlice';
import apiClient from '../api/axiosClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await apiClient.post('/auth/admin/send-otp', { email });
      setStep(2);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/admin/verify-otp', { email, otp });
      const user = res.data.data.user;
      dispatch(setUser(user));
      navigate('/');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
      <div className="card" style={{ padding: '40px', width: '100%', maxWidth: '400px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h1 style={{ color: '#f8fafc', marginBottom: '10px', marginTop: 0 }}>WatchAdmin</h1>
        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Sign in to access the dashboard</p>
        
        {step === 1 ? (
          <form onSubmit={handleSendOtp} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="email" 
              className="input" 
              placeholder="Admin Email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" 
              className="input" 
              placeholder="Enter 6-digit OTP" 
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} onClick={() => setStep(1)}>
              Back to Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

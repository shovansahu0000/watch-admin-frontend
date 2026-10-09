import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Watch, Tag, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import apiClient from '../api/axiosClient';

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <div className="admin-layout">
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2>WatchAdmin</h2>
          <button 
            className="collapse-btn" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>
        
        <NavLink 
          to="/" 
          className={({ isActive }) => `btn nav-item ${isActive ? 'active' : ''}`}
          title={isCollapsed ? "Dashboard" : ""}
        >
          <LayoutDashboard size={20} style={{ flexShrink: 0 }} />
          <span className="nav-item-text">Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/products" 
          className={({ isActive }) => `btn nav-item ${isActive ? 'active' : ''}`}
          title={isCollapsed ? "Products" : ""}
        >
          <Watch size={20} style={{ flexShrink: 0 }} />
          <span className="nav-item-text">Products</span>
        </NavLink>
        
        <NavLink 
          to="/brands" 
          className={({ isActive }) => `btn nav-item ${isActive ? 'active' : ''}`}
          title={isCollapsed ? "Brands" : ""}
        >
          <Tag size={20} style={{ flexShrink: 0 }} />
          <span className="nav-item-text">Brands</span>
        </NavLink>
        
        <div style={{ flex: 1 }} />
        
        <button 
          className="btn nav-item" 
          style={{ color: '#ef4444' }} 
          title={isCollapsed ? "Logout" : ""}
          onClick={handleLogout}
        >
          <LogOut size={20} style={{ flexShrink: 0 }} />
          <span className="nav-item-text">Logout</span>
        </button>
      </aside>
      
      <main className="main-content content-area">
        <Outlet />
      </main>
    </div>
  );
}

import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hamburger Menu Component
  const HamburgerButton = ({ isOpen, onClick }) => (
    <button
      className="hamburger-btn"
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '6px',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '40px',
        height: '40px',
        position: 'relative'
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
    >
      <span
        style={{
          display: 'block',
          width: '22px',
          height: '2px',
          backgroundColor: '#fff',
          borderRadius: '1px',
          transition: 'all 0.3s ease',
          transform: isOpen ? 'rotate(45deg) translate(5px, 5px)' : 'rotate(0deg) translate(0px, 0px)',
          marginBottom: isOpen ? '0' : '3px'
        }}
      />
      <span
        style={{
          display: 'block',
          width: '22px',
          height: '2px',
          backgroundColor: '#fff',
          borderRadius: '1px',
          transition: 'all 0.3s ease',
          opacity: isOpen ? '0' : '1',
          marginBottom: isOpen ? '0' : '4px'
        }}
      />
      <span
        style={{
          display: 'block',
          width: '22px',
          height: '2px',
          backgroundColor: '#fff',
          borderRadius: '1px',
          transition: 'all 0.3s ease',
          transform: isOpen ? 'rotate(-45deg) translate(7px, -6px)' : 'rotate(0deg) translate(0px, 0px)'
        }}
      />
    </button>
  );

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Floating Hamburger Button (when sidebar is collapsed) */}
      {sidebarCollapsed && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1001,
            background: 'linear-gradient(135deg, #2c3e50, #34495e)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            padding: '8px'
          }}
        >
          <HamburgerButton 
            isOpen={false} 
            onClick={() => setSidebarCollapsed(false)} 
          />
        </div>
      )}

      {/* Sidebar */}
      <div 
        className="sidebar"
        style={{
          width: sidebarCollapsed ? '0px' : '280px',
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          position: 'fixed',
          height: '100vh',
          zIndex: 1000,
          background: 'linear-gradient(180deg, #2c3e50 0%, #34495e 100%)',
          boxShadow: sidebarCollapsed ? 'none' : '4px 0 20px rgba(0,0,0,0.15)',
          borderRadius: sidebarCollapsed ? '0' : '0 15px 15px 0',
          overflow: 'hidden',
          transform: sidebarCollapsed ? 'translateX(-100%)' : 'translateX(0)',
          opacity: sidebarCollapsed ? 0 : 1
        }}
      >
        <div className="d-flex flex-column h-100">
          {/* Header with Hamburger */}
          <div 
            className="sidebar-header"
            style={{
              padding: '20px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '80px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#3498db',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                  fontSize: '20px',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                Q
              </div>
              <div>
                <h5 className="mb-0" style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>
                  Quiz Master
                </h5>
                <small style={{ color: '#bdc3c7', fontSize: '12px' }}>Admin Panel</small>
              </div>
            </div>
            <HamburgerButton 
              isOpen={true} 
              onClick={() => setSidebarCollapsed(true)} 
            />
          </div>
          
          {/* Navigation */}
          <nav className="flex-grow-1" style={{ padding: '20px 0' }}>
            <div className="nav-items">
              <NavLink 
                to="/admin" 
                end 
                className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 20px',
                  margin: '8px 20px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#ecf0f1',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  minHeight: '50px'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0px)';
                  }
                }}
              >
                <i 
                  className="bi bi-speedometer2" 
                  style={{ 
                    fontSize: '20px',
                    minWidth: '20px',
                    color: '#3498db'
                  }}
                />
                <span style={{ marginLeft: '15px', fontSize: '15px', fontWeight: '500' }}>
                  Dashboard
                </span>
              </NavLink>
              
              <NavLink 
                to="/admin/subjects" 
                className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 20px',
                  margin: '8px 20px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#ecf0f1',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  minHeight: '50px'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0px)';
                  }
                }}
              >
                <i 
                  className="bi bi-book" 
                  style={{ 
                    fontSize: '20px',
                    minWidth: '20px',
                    color: '#e74c3c'
                  }}
                />
                <span style={{ marginLeft: '15px', fontSize: '15px', fontWeight: '500' }}>
                  Subjects
                </span>
              </NavLink>
              
              <NavLink 
                to="/admin/chapters" 
                className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 20px',
                  margin: '8px 20px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#ecf0f1',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  minHeight: '50px'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0px)';
                  }
                }}
              >
                <i 
                  className="bi bi-list-columns" 
                  style={{ 
                    fontSize: '20px',
                    minWidth: '20px',
                    color: '#f39c12'
                  }}
                />
                <span style={{ marginLeft: '15px', fontSize: '15px', fontWeight: '500' }}>
                  Chapters
                </span>
              </NavLink>
              
              <NavLink 
                to="/admin/quizzes" 
                className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 20px',
                  margin: '8px 20px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#ecf0f1',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  minHeight: '50px'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0px)';
                  }
                }}
              >
                <i 
                  className="bi bi-question-circle" 
                  style={{ 
                    fontSize: '20px',
                    minWidth: '20px',
                    color: '#9b59b6'
                  }}
                />
                <span style={{ marginLeft: '15px', fontSize: '15px', fontWeight: '500' }}>
                  Quizzes
                </span>
              </NavLink>
              
              <NavLink 
                to="/admin/questions" 
                className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 20px',
                  margin: '8px 20px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#ecf0f1',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  minHeight: '50px'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0px)';
                  }
                }}
              >
                <i 
                  className="bi bi-patch-question" 
                  style={{ 
                    fontSize: '20px',
                    minWidth: '20px',
                    color: '#1abc9c'
                  }}
                />
                <span style={{ marginLeft: '15px', fontSize: '15px', fontWeight: '500' }}>
                  Questions
                </span>
              </NavLink>
              
              <NavLink 
                to="/admin/users" 
                className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 20px',
                  margin: '8px 20px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#ecf0f1',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  minHeight: '50px'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0px)';
                  }
                }}
              >
                <i 
                  className="bi bi-people" 
                  style={{ 
                    fontSize: '20px',
                    minWidth: '20px',
                    color: '#34495e'
                  }}
                />
                <span style={{ marginLeft: '15px', fontSize: '15px', fontWeight: '500' }}>
                  Users
                </span>
              </NavLink>
              
              <NavLink 
                to="/admin/reports" 
                className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px 20px',
                  margin: '8px 20px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#ecf0f1',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  minHeight: '50px'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0px)';
                  }
                }}
              >
                <i 
                  className="bi bi-bar-chart" 
                  style={{ 
                    fontSize: '20px',
                    minWidth: '20px',
                    color: '#e67e22'
                  }}
                />
                <span style={{ marginLeft: '15px', fontSize: '15px', fontWeight: '500' }}>
                  Reports
                </span>
              </NavLink>
            </div>
          </nav>
          
          {/* Logout Button */}
          <div 
            style={{ 
              padding: '20px',
              borderTop: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <button 
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '15px 20px',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                border: '1px solid rgba(231, 76, 60, 0.3)',
                borderRadius: '12px',
                color: '#e74c3c',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                fontSize: '15px',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(231, 76, 60, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
                e.target.style.transform = 'translateY(0px)';
              }}
            >
              <i className="bi bi-box-arrow-right" style={{ fontSize: '20px', minWidth: '20px' }} />
              <span style={{ marginLeft: '15px' }}>Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div 
        className="main-content"
        style={{
          marginLeft: sidebarCollapsed ? '0px' : '280px',
          transition: 'margin-left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          minHeight: '100vh',
          width: sidebarCollapsed ? '100%' : 'calc(100% - 280px)',
          backgroundColor: '#f8f9fa'
        }}
      >
        {/* Enhanced Header */}
        <header 
          style={{
            backgroundColor: '#fff',
            boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
            padding: sidebarCollapsed ? '20px 30px 20px 80px' : '20px 30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            borderBottom: '1px solid #e9ecef',
            borderRadius: '0 0 15px 15px',
            transition: 'padding 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}
        >
          <div>
            <h4 className="mb-1"  style={{ color: '#2c3e50', fontWeight: '600' }}>
             Quiz Master
            </h4>
            <small style={{ color: '#7f8c8d' }}>Manage your quiz application</small>
          </div>
          <div className="d-flex align-items-center">
            <div 
              style={{
                backgroundColor: '#f8f9fa',
                padding: '8px 16px',
                borderRadius: '25px',
                border: '1px solid #e9ecef',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#3498db',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '10px',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                {(currentUser?.full_name || 'Admin').charAt(0).toUpperCase()}
              </div>
              <span style={{ color: '#2c3e50', fontWeight: '500', fontSize: '14px' }}>
                Welcome, {currentUser?.full_name || 'Admin'}
              </span>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main style={{ padding: '30px' }}>
          <Outlet />
        </main>
      </div>

      {/* Add CSS for active states */}
      <style jsx>{`
        .nav-item.active {
          background: linear-gradient(135deg, #3498db, #2980b9) !important;
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
          transform: translateX(5px);
        }
        .nav-item.active:hover {
          transform: translateX(5px) !important;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout; 
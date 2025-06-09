import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      } else {
        // On desktop, ensure sidebar is visible by default
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    navigate('/admin/profile');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: 'bi-grid-1x2-fill', end: true, color: '#6366f1' },
    { path: '/admin/subjects', label: 'Subjects', icon: 'bi-book-fill', color: '#10b981' },
    { path: '/admin/chapters', label: 'Chapters', icon: 'bi-bookmark-fill', color: '#f59e0b' },
    { path: '/admin/quizzes', label: 'Quizzes', icon: 'bi-question-circle-fill', color: '#8b5cf6' },
    { path: '/admin/questions', label: 'Questions', icon: 'bi-patch-question-fill', color: '#06b6d4' },
    { path: '/admin/users', label: 'Users', icon: 'bi-people-fill', color: '#ef4444' },
    { path: '/admin/reports', label: 'Reports', icon: 'bi-bar-chart-fill', color: '#f97316' }
  ];

  return (
    <div className="admin-layout" style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Overlay for mobile */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="sidebar-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1040,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Modern Sidebar */}
      <div 
        className="modern-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '280px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: sidebarCollapsed ? 'none' : '0 20px 60px rgba(0, 0, 0, 0.1)',
          transform: sidebarCollapsed ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.25s ease',
          zIndex: isMobile ? 1050 : 1000,
          overflow: 'hidden',
          willChange: 'transform'
        }}
      >
        <div className="sidebar-content" style={{ 
          padding: '24px', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          {/* Logo Section */}
          <div className="logo-section" style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
                fontSize: '24px',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
              }}>
                🎓
              </div>
              <div>
                <h4 style={{ 
                  margin: 0, 
                  fontSize: '20px', 
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Quiz Master
                </h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px', 
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  Admin Dashboard
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="nav-section" style={{ flex: 1 }}>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ 
                fontSize: '12px', 
                fontWeight: '600', 
                textTransform: 'uppercase', 
                color: '#64748b',
                margin: '0 0 16px 0',
                letterSpacing: '0.05em'
              }}>
                NAVIGATION
              </p>
              <div className="nav-items">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 20px',
                      margin: '4px 0',
                      borderRadius: '16px',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontWeight: '600',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: isActive 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                        : 'transparent',
                      color: isActive ? '#fff' : '#475569',
                      boxShadow: isActive 
                        ? '0 8px 32px rgba(102, 126, 234, 0.3)' 
                        : 'none',
                      transform: isActive ? 'translateX(8px)' : 'translateX(0)',
                      position: 'relative',
                      overflow: 'hidden'
                    })}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.classList.contains('active')) {
                        e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                        e.currentTarget.style.color = '#667eea';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.classList.contains('active')) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.color = '#475569';
                      }
                    }}
                  >
                    <i 
                      className={item.icon} 
                      style={{ 
                        fontSize: '20px', 
                        marginRight: '16px',
                        minWidth: '20px'
                      }}
                    />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>

          {/* User Profile Card */}
          <div className="user-profile-card" style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            marginTop: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                marginRight: '12px',
                boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)'
              }}>
                👨‍💼
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  lineHeight: '1.2'
                }}>
                  {currentUser?.full_name || 'Administrator'}
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '13px', 
                  color: '#64748b',
                  lineHeight: '1.2'
                }}>
                  {currentUser?.email || 'admin@quizmaster.com'}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleProfileClick}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)';
                }}
              >
                <i className="bi bi-person me-2"></i>
                Profile
              </button>
              
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '12px',
                  color: '#ef4444',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className="main-content"
        style={{
          marginLeft: !isMobile ? (sidebarCollapsed ? '0' : '280px') : '0',
          width: !isMobile ? (sidebarCollapsed ? '100%' : 'calc(100% - 280px)') : '100%',
          transition: !isMobile ? 'margin-left 0.25s cubic-bezier(0.25, 0.8, 0.25, 1), width 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none',
          minHeight: '100vh',
          position: 'relative',
          willChange: !isMobile ? 'margin-left, width' : 'auto',
          maxWidth: '100vw',
          overflow: 'hidden',
          zIndex: 1
        }}
      >
        {/* Top Header */}
        <header style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={toggleSidebar}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginRight: '20px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 8px 32px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.3)';
              }}
            >
                             <i 
                 className={`bi ${sidebarCollapsed ? 'bi-list' : 'bi-x-lg'}`}
                 style={{ 
                   color: '#fff', 
                   fontSize: '18px',
                   transition: 'transform 0.2s ease',
                   transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(90deg)'
                 }}
               />
            </button>

            <div>
              <h2 style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Admin Dashboard
              </h2>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                color: '#64748b',
                fontWeight: '500'
              }}>
                Manage your quiz application efficiently
              </p>
            </div>
          </div>

          {/* Search and Notifications */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
                     <div className="dropdown">
             <button 
               className="btn dropdown-toggle d-flex align-items-center rounded-pill px-3 py-2"
               type="button" 
               id="adminDropdown" 
               data-bs-toggle="dropdown" 
               aria-expanded="false"
               style={{
                 background: 'rgba(255, 255, 255, 0.9)',
                 border: '1px solid rgba(102, 126, 234, 0.2)',
                 backdropFilter: 'blur(10px)',
                 color: '#475569',
                 fontWeight: '500',
                 transition: 'all 0.3s ease',
                 boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
               }}
             >
              <div className="d-flex align-items-center me-2" style={{
                width: '35px',
                height: '35px',
                background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}>
                👨‍💼
              </div>
                             <div className="d-none d-md-flex flex-column text-start">
                 <span style={{ fontSize: '14px', lineHeight: '1.2', color: '#1e293b' }}>Admin</span>
                 <small style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.2' }}>Dashboard</small>
               </div>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" style={{ borderRadius: '12px' }}>
              <li>
                <div className="dropdown-item-text">
                  <div className="d-flex align-items-center">
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      marginRight: '12px'
                    }}>
                      👨‍💼
                    </div>
                    <div>
                      <div className="fw-semibold">{currentUser?.full_name || 'Administrator'}</div>
                      <div className="text-muted small">{currentUser?.email || 'admin@quizmaster.com'}</div>
                    </div>
                  </div>
                </div>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button 
                  className="dropdown-item d-flex align-items-center py-2" 
                  onClick={handleProfileClick}
                  style={{ 
                    transition: 'all 0.2s ease',
                    borderRadius: '8px',
                    margin: '0 8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <i className="bi bi-person me-2 text-primary"></i>
                  Profile Settings
                </button>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button 
                  className="dropdown-item d-flex align-items-center py-2 text-danger" 
                  onClick={handleLogout}
                  style={{ 
                    transition: 'all 0.2s ease',
                    borderRadius: '8px',
                    margin: '0 8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#fff5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
           
          </div>
        </header>

        {/* Content */}
        <main style={{ 
          padding: '32px',
          background: 'rgba(255, 255, 255, 0.5)',
          minHeight: 'calc(100vh - 84px)',
          backdropFilter: 'blur(10px)',
          width: '100%',
          maxWidth: '100%',
          overflow: 'auto'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden'
          }}>
            <Outlet />
          </div>
        </main>
      </div>



      {/* Custom Styles */}
      <style jsx>{`
        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: #fff;
          border-radius: 0 4px 4px 0;
        }
        
        .admin-layout * {
          box-sizing: border-box;
        }
        
        .modern-sidebar::-webkit-scrollbar {
          width: 6px;
        }
        
        .modern-sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .modern-sidebar::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.2);
          border-radius: 3px;
        }
        
        .modern-sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(102, 126, 234, 0.4);
        }
        
        /* Performance optimizations */
        .modern-sidebar {
          backface-visibility: hidden;
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
          will-change: transform;
          contain: layout style paint;
        }
        
        .main-content {
          backface-visibility: hidden;
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
          will-change: transform;
          contain: layout style paint;
        }
        
        .sidebar-overlay {
          backface-visibility: hidden;
          will-change: opacity, visibility;
        }
        
        /* Force hardware acceleration */
        .modern-sidebar,
        .main-content {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }
        
        /* Desktop behavior */
        @media (min-width: 769px) {
          .main-content {
            transition: margin-left 0.25s cubic-bezier(0.25, 0.8, 0.25, 1), width 0.25s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
          }
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            width: 100% !important;
            max-width: 100vw !important;
            transform: none !important;
            transition: none !important;
          }
          
          .modern-sidebar {
            z-index: 1050 !important;
          }
          
          .sidebar-overlay {
            z-index: 1040 !important;
          }
        }
        
        /* Ensure content doesn't get hidden */
        .main-content > * {
          position: relative;
          z-index: 2;
        }
        
        /* Prevent horizontal scrolling */
        .admin-layout {
          overflow-x: hidden;
        }
        
        /* Ensure tables and wide content are responsive */
        .main-content table {
          max-width: 100%;
          overflow-x: auto;
        }
        
        .main-content .table-responsive {
          max-width: 100%;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout; 
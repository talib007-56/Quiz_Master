import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  // Initialize sidebar state from localStorage, default to true (collapsed) if not found
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    return saved ? JSON.parse(saved) : true;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      // On mobile, always collapse sidebar for better UX
      if (mobile) {
        setSidebarCollapsed(true);
        localStorage.setItem('adminSidebarCollapsed', JSON.stringify(true));
      }
      // On desktop, keep the saved state from localStorage
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
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    // Persist sidebar state to localStorage
    localStorage.setItem('adminSidebarCollapsed', JSON.stringify(newState));
  };

  const navItems = [
    { 
      path: '/admin', 
      label: 'Dashboard', 
      icon: 'bi-speedometer2', 
      end: true, 
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'Overview & Stats'
    },
    { 
      path: '/admin/analytics', 
      label: 'Analytics', 
      icon: 'bi-graph-up-arrow', 
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      description: 'Performance Insights'
    },
    { 
      path: '/admin/subjects', 
      label: 'Subjects', 
      icon: 'bi-collection-fill', 
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      description: 'Course Subjects'
    },
    { 
      path: '/admin/chapters', 
      label: 'Chapters', 
      icon: 'bi-journal-bookmark-fill', 
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      description: 'Chapter Management'
    },
    { 
      path: '/admin/quizzes', 
      label: 'Quizzes', 
      icon: 'bi-puzzle-fill', 
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      description: 'Quiz Creation'
    },
    { 
      path: '/admin/questions', 
      label: 'Questions', 
      icon: 'bi-question-octagon-fill', 
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      description: 'Question Bank'
    },
    { 
      path: '/admin/users', 
      label: 'Users', 
      icon: 'bi-person-hearts', 
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      description: 'User Management'
    }
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
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1040,
            backdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.3s ease-out'
          }}
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Enhanced Modern Sidebar */}
      <div 
        className="modern-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '320px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
          backdropFilter: 'blur(25px)',
          border: 'none',
          borderRight: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: sidebarCollapsed 
            ? 'none' 
            : '0 25px 80px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)',
          transform: sidebarCollapsed ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: isMobile ? 1050 : 1000,
          overflowY: 'auto',
          overflowX: 'hidden',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          perspective: '1000px'
        }}
      >
        <div className="sidebar-content" style={{ 
          padding: '32px 28px', 
          minHeight: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative'
        }}>
          {/* Enhanced Logo Section */}
          <div className="logo-section" style={{ marginBottom: '48px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
                fontSize: '28px',
                boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                  animation: 'shimmer 3s infinite'
                }} />
                <span style={{ position: 'relative', zIndex: 1 }}>🎓</span>
              </div>
              <div>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '24px', 
                  fontWeight: '800',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.2'
                }}>
                  GyaanX
                </h3>
                <p style={{ 
                  margin: '2px 0 0 0', 
                  fontSize: '14px', 
                  color: '#64748b',
                  fontWeight: '600',
                  letterSpacing: '0.02em'
                }}>
                  Admin Control Center
                </p>
              </div>
            </div>
            
            {/* Decorative element */}
            <div style={{
              position: 'absolute',
              bottom: '-16px',
              left: '0',
              right: '0',
              height: '1px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%)'
            }} />
          </div>

          {/* Enhanced Navigation */}
          <nav className="nav-section" style={{ flex: 1 }}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px',
                padding: '0 4px'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  marginRight: '12px'
                }} />
              <p style={{ 
                  fontSize: '13px', 
                  fontWeight: '700', 
                textTransform: 'uppercase', 
                color: '#64748b',
                  margin: 0,
                  letterSpacing: '0.1em'
              }}>
                  Navigation
              </p>
              </div>
              
              <div className="nav-items" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {navItems.map((item, index) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      padding: '18px 24px',
                      borderRadius: '20px',
                      textDecoration: 'none',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      background: isActive 
                        ? item.gradient
                        : 'transparent',
                      color: isActive ? '#fff' : '#475569',
                      boxShadow: isActive 
                        ? '0 20px 40px rgba(102, 126, 234, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)' 
                        : 'none',
                      transform: isActive ? 'translateX(8px) scale(1.02)' : 'translateX(0) scale(1)',
                      position: 'relative',
                      overflow: 'hidden',
                      border: isActive ? 'none' : '1px solid transparent'
                    })}
                    onMouseEnter={(e) => {
                      if (!e.currentTarget.classList.contains('active')) {
                        e.currentTarget.style.background = 'rgba(102, 126, 234, 0.08)';
                        e.currentTarget.style.transform = 'translateX(6px) scale(1.01)';
                        e.currentTarget.style.color = '#667eea';
                        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.currentTarget.classList.contains('active')) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0) scale(1)';
                        e.currentTarget.style.color = '#475569';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {({ isActive }) => (
                      <>
                        {/* Icon with gradient background */}
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '14px',
                          background: isActive ? 'rgba(255, 255, 255, 0.2)' : item.gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '16px',
                          transition: 'all 0.3s ease',
                          boxShadow: isActive ? 'none' : '0 8px 20px rgba(0, 0, 0, 0.1)'
                        }}>
                    <i 
                      className={item.icon} 
                      style={{ 
                        fontSize: '20px', 
                              color: '#fff',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontSize: '16px', 
                            fontWeight: '600',
                            lineHeight: '1.2',
                            marginBottom: '2px'
                          }}>
                            {item.label}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            opacity: isActive ? 0.9 : 0.7,
                            fontWeight: '500',
                            color: isActive ? '#fff' : '#64748b'
                          }}>
                            {item.description}
                          </div>
                        </div>

                        {/* Active indicator */}
                        {isActive && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#fff',
                            marginLeft: '12px',
                            animation: 'pulse 2s infinite'
                          }} />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          </nav>

          {/* Enhanced Logout Button */}
          <div style={{ marginTop: 'auto', position: 'relative' }}>
            {/* Decorative background glow */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '-10px',
              right: '-10px',
              bottom: '-10px',
              background: 'radial-gradient(ellipse at center, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
              borderRadius: '30px',
              filter: 'blur(8px)',
              opacity: 0.7
            }} />
            
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '20px 28px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #5b21b6 100%)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '24px',
                color: '#fff',
                fontSize: '17px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: `
                  0 20px 40px rgba(102, 126, 234, 0.35),
                  0 0 0 1px rgba(255, 255, 255, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                position: 'relative',
                overflow: 'hidden',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-6px) scale(1.03)';
                e.target.style.boxShadow = `
                  0 30px 60px rgba(102, 126, 234, 0.5),
                  0 0 0 1px rgba(255, 255, 255, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.3)
                `;
                e.target.style.background = 'linear-gradient(135deg, #818cf8 0%, #667eea 50%, #764ba2 100%)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = `
                  0 20px 40px rgba(102, 126, 234, 0.35),
                  0 0 0 1px rgba(255, 255, 255, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `;
                e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #5b21b6 100%)';
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.target.style.transform = 'translateY(-6px) scale(1.03)';
              }}
            >
              {/* Animated shimmer effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                animation: 'shimmerSweep 3s infinite',
                transform: 'skewX(-25deg)'
              }} />
              
              {/* Floating particles effect */}
              <div style={{
                position: 'absolute',
                top: '20%',
                left: '15%',
                width: '4px',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                animation: 'float 2s infinite ease-in-out'
              }} />
              <div style={{
                position: 'absolute',
                top: '60%',
                right: '20%',
                width: '3px',
                height: '3px',
                background: 'rgba(255, 255, 255, 0.4)',
                borderRadius: '50%',
                animation: 'float 2.5s infinite ease-in-out 0.5s'
              }} />
              <div style={{
                position: 'absolute',
                top: '40%',
                left: '70%',
                width: '2px',
                height: '2px',
                background: 'rgba(255, 255, 255, 0.5)',
                borderRadius: '50%',
                animation: 'float 2.2s infinite ease-in-out 1s'
              }} />
              
              {/* Icon with enhanced styling */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                position: 'relative',
                zIndex: 2,
                backdropFilter: 'blur(10px)'
              }}>
                <i 
                  className="bi bi-box-arrow-right" 
                  style={{ 
                    fontSize: '18px',
                    position: 'relative',
                    zIndex: 1,
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                  }}
                />
              </div>
              
              {/* Text with enhanced styling */}
              <span style={{ 
                position: 'relative', 
                zIndex: 2,
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                Logout
              </span>
              
              {/* Bottom highlight */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: '10%',
                right: '10%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
                borderRadius: '1px'
              }} />
              </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className="main-content"
        style={{
          marginLeft: !isMobile ? (sidebarCollapsed ? '0' : '320px') : '0',
          width: !isMobile ? (sidebarCollapsed ? '100%' : 'calc(100% - 320px)') : '100%',
          transition: !isMobile ? 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          minHeight: '100vh',
          position: 'relative',
          willChange: !isMobile ? 'margin-left, width' : 'auto',
          maxWidth: '100vw',
          overflow: 'visible',
          zIndex: 1,
          transform: 'translateZ(0)', // Enable hardware acceleration
          backfaceVisibility: 'hidden'
        }}
      >
        {/* Enhanced Top Header */}
        <header style={{
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
          backdropFilter: 'blur(25px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
          padding: '24px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={toggleSidebar}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '16px',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginRight: '24px',
                transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                transform: 'translateZ(0)', // Enable hardware acceleration
                willChange: 'transform'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05) translateZ(0)';
                e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1) translateZ(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                animation: 'shimmer 3s infinite'
              }} />
                             <i 
                 className={`bi ${sidebarCollapsed ? 'bi-list' : 'bi-x-lg'}`}
                 style={{ 
                   color: '#fff', 
                  fontSize: '20px',
                  transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  transform: 'translateZ(0)',
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px'
                 }}
               />
            </button>

            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '28px', 
                fontWeight: '800',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                lineHeight: '1.2'
              }}>
                Admin Dashboard
              </h1>
              <p style={{ 
                margin: '4px 0 0 0', 
                fontSize: '15px', 
                color: '#64748b',
                fontWeight: '500',
                letterSpacing: '0.01em'
              }}>
                Manage your quiz application with ease
              </p>
            </div>
          </div>

          {/* Enhanced User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                     <div className="dropdown">
             <button 
                className="btn dropdown-toggle d-flex align-items-center rounded-pill px-4 py-3"
               type="button" 
               id="adminDropdown" 
               data-bs-toggle="dropdown" 
               aria-expanded="false"
               style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)',
                 border: '1px solid rgba(102, 126, 234, 0.2)',
                  backdropFilter: 'blur(15px)',
                 color: '#475569',
                  fontWeight: '600',
                 transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.02)';
                  e.target.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
               }}
             >
                <div className="d-flex align-items-center me-3" style={{
                  width: '40px',
                  height: '40px',
                background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
                  borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                  fontSize: '18px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                    animation: 'shimmer 3s infinite'
                  }} />
                  <span style={{ position: 'relative', zIndex: 1 }}>👨‍💼</span>
              </div>
                             <div className="d-none d-md-flex flex-column text-start">
                  <span style={{ fontSize: '15px', lineHeight: '1.2', color: '#1e293b', fontWeight: '700' }}>Admin</span>
                  <small style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.2', fontWeight: '500' }}>Control Panel</small>
               </div>
            </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-3" style={{ 
                borderRadius: '20px', 
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
              <li>
                  <div className="dropdown-item-text" style={{ padding: '16px' }}>
                  <div className="d-flex align-items-center">
                    <div style={{
                        width: '48px',
                        height: '48px',
                      background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
                        borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                        fontSize: '20px',
                        marginRight: '16px',
                        boxShadow: '0 8px 20px rgba(255, 107, 107, 0.2)'
                    }}>
                      👨‍💼
                    </div>
                    <div>
                        <div className="fw-bold" style={{ fontSize: '16px', color: '#1e293b' }}>
                          {currentUser?.full_name || 'Administrator'}
                        </div>
                        <div className="text-muted small" style={{ fontSize: '13px', color: '#64748b' }}>
                          {currentUser?.email || 'admin@bcaquest.com'}
                        </div>
                    </div>
                  </div>
                </div>
              </li>
                <li><hr className="dropdown-divider" style={{ margin: '12px 0', opacity: 0.3 }} /></li>
              <li>
                <button 
                    className="dropdown-item d-flex align-items-center py-3 px-4" 
                  onClick={handleProfileClick}
                  style={{ 
                    transition: 'all 0.2s ease',
                      borderRadius: '12px',
                      margin: '4px 0',
                      fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                      e.target.style.color = '#667eea';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = 'inherit';
                  }}
                >
                    <i className="bi bi-person-gear me-3 text-primary"></i>
                  Profile Settings
                </button>
              </li>
                <li><hr className="dropdown-divider" style={{ margin: '12px 0', opacity: 0.3 }} /></li>
              <li>
                <button 
                    className="dropdown-item d-flex align-items-center py-3 px-4 text-danger" 
                  onClick={handleLogout}
                  style={{ 
                    transition: 'all 0.2s ease',
                      borderRadius: '12px',
                      margin: '4px 0',
                      fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                    <i className="bi bi-box-arrow-right me-3"></i>
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ 
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.4)',
          minHeight: 'calc(100vh - 96px)',
          backdropFilter: 'blur(10px)',
          width: '100%',
          maxWidth: '100%',
          overflow: 'visible'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '100%',
            overflow: 'visible'
          }}>
            <Outlet />
          </div>
        </main>
      </div>

      {/* Enhanced Custom Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInLeft {
          from { 
            transform: translateX(-100%) scale(0.95);
            opacity: 0;
          }
          to { 
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        
        @keyframes shimmerSweep {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: translateY(-8px) scale(1.2);
            opacity: 1;
          }
        }
        
        .nav-item.active::before {
          content: '';
          position: absolute;
          left: -2px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 24px;
          background: #fff;
          border-radius: 0 6px 6px 0;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
        
        .admin-layout * {
          box-sizing: border-box;
        }
        
        .modern-sidebar::-webkit-scrollbar {
          width: 6px;
        }
        
        .modern-sidebar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          margin: 8px 0;
        }
        
        .modern-sidebar::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.3);
          border-radius: 3px;
          transition: background 0.3s ease;
        }
        
        .modern-sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(102, 126, 234, 0.5);
        }
        
        .modern-sidebar::-webkit-scrollbar-thumb:active {
          background: rgba(102, 126, 234, 0.7);
        }
        
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
        
        .modern-sidebar,
        .main-content {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
        }
        
        @media (min-width: 769px) {
          .main-content {
            transition: margin-left 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), width 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
          }
        }
        
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
            width: 300px !important;
          }
          
          .sidebar-overlay {
            z-index: 1040 !important;
          }
        }
        
        .main-content > * {
          position: relative;
          z-index: 2;
        }
        
        .admin-layout {
          overflow-x: hidden;
          position: relative;
        }
        
        .main-content table {
          max-width: 100%;
          overflow-x: auto;
        }
        
        .main-content .table-responsive {
          max-width: 100%;
          overflow-x: auto;
        }
        
        .nav-item:hover .icon-container {
          transform: scale(1.1) rotate(5deg);
        }
        
        button, .nav-item, .dropdown-item {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout; 
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Initialize sidebar state from localStorage, default to false if not found
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('userSidebarOpen');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [hoveredLink, setHoveredLink] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      // On mobile, always close sidebar for better UX
      if (mobile) {
        setSidebarOpen(false);
        localStorage.setItem('userSidebarOpen', JSON.stringify(false));
      }
      // On desktop, keep the saved state from localStorage
    };

    // Set initial state
    handleResize();
    
    // Add resize listener with debounce
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 100);
    };
    
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    // Persist sidebar state to localStorage
    localStorage.setItem('userSidebarOpen', JSON.stringify(newState));
  };

  const getPageTitle = () => {
    if (location.pathname === '/user') return 'Dashboard';
    if (location.pathname === '/user/subjects') return 'Subjects';
    if (location.pathname === '/user/profile') return 'My Profile';
    return 'BCA Quest';
  };

  const getLinkStyle = (linkPath, isActive) => {
    const isHovered = hoveredLink === linkPath;
    let backgroundColor = 'transparent';
    
    if (isActive) {
      backgroundColor = 'rgba(255, 255, 255, 0.2)';
    } else if (isHovered) {
      backgroundColor = 'rgba(255, 255, 255, 0.1)';
    }
    
    return {
      fontWeight: isActive ? '600' : '400',
      backgroundColor: backgroundColor,
      transition: 'all 0.3s ease'
    };
  };

  return (
    <>
      <style>{`
        .user-sidebar {
          will-change: width, transform;
        }
        
        .user-main-content {
          will-change: margin-left;
        }
        
        @media (max-width: 991.98px) {
          .user-sidebar {
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
          }
        }
        
        .user-nav-link {
          transition: all 0.3s ease;
        }
      `}</style>
      <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <div 
        className="bg-primary text-white user-sidebar"
        style={{
          width: isMobile ? (sidebarOpen ? '280px' : '0px') : (sidebarOpen ? '280px' : '0px'),
          transition: 'width 0.3s ease, transform 0.3s ease',
          overflow: 'hidden',
          minHeight: '100vh',
          transform: isMobile && !sidebarOpen ? 'translateX(-280px)' : 'translateX(0)',
          position: isMobile ? 'fixed' : 'relative',
          zIndex: isMobile ? 1050 : 'auto',
          left: 0,
          top: 0,
          flexShrink: 0
        }}
      >
        <div className="d-flex flex-column h-100">
          {/* Sidebar Header */}
          <div className="p-3 border-bottom border-light border-opacity-25">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <div className="bg-white rounded p-2 me-2">
                  <i className="bi bi-mortarboard-fill text-primary fs-5"></i>
                </div>
                <div>
                  <h5 className="mb-0 text-white fw-bold">BCA Quest</h5>
                  <small className="text-light">Learning Platform</small>
                </div>
              </div>
              <button 
                className="btn btn-outline-light btn-sm"
                onClick={toggleSidebar}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-grow-1 p-3">
            <ul className="nav flex-column">
              <li className="nav-item mb-2">
                <NavLink
                  to="/user"
                  end
                  className={({isActive}) => 
                    `nav-link user-nav-link d-flex align-items-center p-3 rounded text-decoration-none ${
                      isActive ? 'text-white' : 'text-light'
                    }`
                  }
                  style={({isActive}) => getLinkStyle('/user', isActive)}
                  onMouseEnter={() => setHoveredLink('/user')}
                  onMouseLeave={() => setHoveredLink(null)}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <i className="bi bi-speedometer2 me-3 fs-5"></i>
                  <span>Dashboard</span>
                </NavLink>
              </li>
              
              <li className="nav-item mb-2">
                <NavLink
                  to="/user/subjects"
                  className={({isActive}) => 
                    `nav-link user-nav-link d-flex align-items-center p-3 rounded text-decoration-none ${
                      isActive ? 'text-white' : 'text-light'
                    }`
                  }
                  style={({isActive}) => getLinkStyle('/user/subjects', isActive)}
                  onMouseEnter={() => setHoveredLink('/user/subjects')}
                  onMouseLeave={() => setHoveredLink(null)}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <i className="bi bi-book me-3 fs-5"></i>
                  <span>Subjects</span>
                </NavLink>
              </li>
              
              <li className="nav-item mb-2">
                <NavLink
                  to="/user/profile"
                  className={({isActive}) => 
                    `nav-link user-nav-link d-flex align-items-center p-3 rounded text-decoration-none ${
                      isActive ? 'text-white' : 'text-light'
                    }`
                  }
                  style={({isActive}) => getLinkStyle('/user/profile', isActive)}
                  onMouseEnter={() => setHoveredLink('/user/profile')}
                  onMouseLeave={() => setHoveredLink(null)}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <i className="bi bi-person-circle me-3 fs-5"></i>
                  <span>My Profile</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="border-top border-light border-opacity-25 p-3">
            
            <button 
              onClick={handleLogout}
              className="btn btn-outline-light w-100"
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="position-fixed w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1049, top: 0, left: 0 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div 
        className="flex-grow-1 d-flex flex-column bg-light user-main-content"
        style={{
          marginLeft: isMobile ? '0' : '0',
          width: isMobile ? '100%' : 'auto',
          transition: 'margin-left 0.3s ease'
        }}
      >
        {/* Top Header */}
        <header className="bg-white shadow-sm border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <button 
                className="btn btn-primary me-3"
                onClick={toggleSidebar}
                style={{ 
                  display: (!isMobile && sidebarOpen) ? 'none' : 'block',
                  transition: 'all 0.3s ease'
                }}
              >
                <i className={`bi ${sidebarOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
              </button>
              <div>
                <h2 className="mb-0 text-primary fw-bold">BCA Quest</h2>
                <small className='text-secondary p-1 rounded-pill bg-light'>AI-Powered Exam Prep</small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="dropdown">
                <button 
                  className="btn btn-outline-primary dropdown-toggle d-flex align-items-center" 
                  type="button" 
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-person-circle me-2"></i>
                  <span className="d-none d-md-inline">
                    {currentUser?.full_name?.split(' ')[0] || 'User'}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <div className="dropdown-item-text">
                      <div className="fw-medium">{currentUser?.full_name || 'User'}</div>
                      <small className="text-muted">{currentUser?.email || 'user@example.com'}</small>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <NavLink to="/user/profile" className="dropdown-item">
                      <i className="bi bi-person me-2"></i>My Profile
                    </NavLink>
                  </li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
    </>
  );
};

export default UserLayout; 
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize(); // Call once on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getPageTitle = () => {
    if (location.pathname === '/user') return 'Dashboard';
    if (location.pathname === '/user/subjects') return 'Subjects';
    if (location.pathname === '/user/profile') return 'My Profile';
    return 'Quiz Master';
  };

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <div 
        className="bg-primary text-white position-relative"
        style={{
          width: sidebarOpen ? '280px' : '0px',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          minHeight: '100vh',
          transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
          position: isMobile ? 'fixed' : 'relative',
          zIndex: 1050,
          left: 0,
          top: 0
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
                  <h5 className="mb-0 text-white fw-bold">Quiz Master</h5>
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
                    `nav-link d-flex align-items-center p-3 rounded ${
                      isActive ? 'nav-link-active' : 'nav-link-inactive'
                    }`
                  }
                >
                  <i className="bi bi-speedometer2 me-3 fs-5"></i>
                  <span>Dashboard</span>
                </NavLink>
              </li>
              
              <li className="nav-item mb-2">
                <NavLink
                  to="/user/subjects"
                  className={({isActive}) => 
                    `nav-link d-flex align-items-center p-3 rounded ${
                      isActive ? 'nav-link-active' : 'nav-link-inactive'
                    }`
                  }
                >
                  <i className="bi bi-book me-3 fs-5"></i>
                  <span>Subjects</span>
                </NavLink>
              </li>
              
              <li className="nav-item mb-2">
                <NavLink
                  to="/user/profile"
                  className={({isActive}) => 
                    `nav-link d-flex align-items-center p-3 rounded ${
                      isActive ? 'nav-link-active' : 'nav-link-inactive'
                    }`
                  }
                >
                  <i className="bi bi-person-circle me-3 fs-5"></i>
                  <span>My Profile</span>
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className="border-top border-light border-opacity-25 p-3">
            <div className="bg-white bg-opacity-10 rounded p-3 mb-3">
              <div className="d-flex align-items-center">
                <div className="bg-white rounded-circle p-2 me-2">
                  <i className="bi bi-person-fill text-primary"></i>
                </div>
                <div className="flex-grow-1">
                  <div className="fw-medium text-white small">
                    {currentUser?.full_name || 'User'}
                  </div>
                  <small className="text-light">
                    {currentUser?.email || 'user@example.com'}
                  </small>
                </div>
              </div>
            </div>
            
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
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-grow-1 d-flex flex-column bg-light">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <button 
                className="btn btn-primary me-3"
                onClick={toggleSidebar}
                style={{ display: sidebarOpen && !isMobile ? 'none' : 'block' }}
              >
                <i className="bi bi-list"></i>
              </button>
              <div>
                <h2 className="mb-0 text-primary fw-bold">Quiz Master</h2>
                <small className='text-secondary p-1 rounded-pill bg-light'>Let's Learn</small>
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
  );
};

export default UserLayout; 
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        {/* Sidebar */}
        <div className={`bg-primary text-white ${sidebarCollapsed ? 'col-1' : 'col-md-2'} p-0`}>
          <div className="d-flex flex-column sticky-top vh-100">
            <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
              {!sidebarCollapsed && <h5 className="mb-0">Quiz Master</h5>}
              <button 
                className="btn btn-sm btn-outline-light" 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? '→' : '←'}
              </button>
            </div>
            
            <nav className="nav flex-column py-3">
              <NavLink to="/user" end className={({isActive}) => 
                `nav-link ${isActive ? 'active bg-light text-primary' : 'text-white'} d-flex align-items-center mb-2`
              }>
                <i className="bi bi-house me-2"></i>
                {!sidebarCollapsed && <span>Dashboard</span>}
              </NavLink>
              
              <NavLink to="/user/subjects" className={({isActive}) => 
                `nav-link ${isActive ? 'active bg-light text-primary' : 'text-white'} d-flex align-items-center mb-2`
              }>
                <i className="bi bi-book me-2"></i>
                {!sidebarCollapsed && <span>Subjects</span>}
              </NavLink>
              
              <NavLink to="/user/profile" className={({isActive}) => 
                `nav-link ${isActive ? 'active bg-light text-primary' : 'text-white'} d-flex align-items-center mb-2`
              }>
                <i className="bi bi-person me-2"></i>
                {!sidebarCollapsed && <span>My Profile</span>}
              </NavLink>
            </nav>
            
            <div className="mt-auto p-3 border-top">
              <button onClick={handleLogout} className="btn btn-outline-light w-100">
                <i className="bi bi-box-arrow-right me-2"></i>
                {!sidebarCollapsed && <span>Logout</span>}
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className={`${sidebarCollapsed ? 'col-11' : 'col-md-10'} p-0`}>
          {/* Header */}
          <header className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Quiz Master</h4>
            {/* <div className="d-flex align-items-center">
              <span className="me-3">
                Welcome, {currentUser?.full_name || 'User'}
              </span>
            </div> */}
            {
              <div className=" mt-auto p-3 border-top">
                <button  onClick={handleLogout} className="btn btn-outline-primary">
                  <i className="bi bi-box-arrow-right me-2"></i>
                  {!sidebarCollapsed && <span>Logout</span>}
                </button>

              </div>
            }
          </header>
          
          {/* Page Content */}
          <main className="p-4">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserLayout; 
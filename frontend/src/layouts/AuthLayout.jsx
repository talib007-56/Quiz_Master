import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="container-fluid">
      <div className="row vh-100">
        {/* Left side - Image/branding */}
        <div className="col-md-6 d-flex align-items-center justify-content-center btn btn-success">
          <div className="text-center text-white">
            <h1 className="display-2 fw-bold mb-4">BCA Quest</h1>
            <p className="lead"> An AI-Powered Exam Preparation App</p>
          </div>
        </div>
        
        {/* Right side - Auth forms */}
        <div className="col-md-6 d-flex align-items-center justify-content-center">
          <div className="card border-0 shadow-sm w-75">
            <div className="card-body p-4">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 
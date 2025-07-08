import React from 'react';

// Base skeleton component
const Skeleton = ({ width = '100%', height = '1rem', className = '', style = {} }) => (
  <div
    className={`skeleton ${className}`}
    style={{
      width,
      height,
      backgroundColor: '#e2e8f0',
      borderRadius: '0.375rem',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      ...style
    }}
  />
);

// Card skeleton loader
export const CardSkeleton = ({ count = 1 }) => (
  <>
    <style>{`
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      @keyframes loading {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `}</style>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="card mb-3 border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="d-flex align-items-center mb-3">
            <Skeleton width="40px" height="40px" className="rounded-circle me-3" />
            <div className="flex-grow-1">
              <Skeleton width="60%" height="1.25rem" className="mb-2" />
              <Skeleton width="40%" height="1rem" />
            </div>
          </div>
          <Skeleton width="100%" height="1rem" className="mb-2" />
          <Skeleton width="80%" height="1rem" className="mb-3" />
          <div className="d-flex justify-content-between">
            <Skeleton width="80px" height="2rem" className="rounded-pill" />
            <Skeleton width="100px" height="2rem" className="rounded-pill" />
          </div>
        </div>
      </div>
    ))}
  </>
);

// Table skeleton loader
export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <div className="table-responsive">
    <table className="table">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index}>
              <Skeleton width="80%" height="1.25rem" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <td key={colIndex}>
                <Skeleton width="90%" height="1rem" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Quiz card skeleton
export const QuizCardSkeleton = ({ count = 3 }) => (
  <div className="row">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="col-md-4 mb-4">
        <div className="card h-100 border-0 shadow-sm">
          <div className="card-body p-4">
            <div className="d-flex align-items-center mb-3">
              <Skeleton width="48px" height="48px" className="rounded me-3" />
              <div className="flex-grow-1">
                <Skeleton width="70%" height="1.25rem" className="mb-1" />
                <Skeleton width="50%" height="1rem" />
              </div>
            </div>
            <Skeleton width="100%" height="1rem" className="mb-2" />
            <Skeleton width="85%" height="1rem" className="mb-3" />
            <div className="d-flex justify-content-between align-items-center">
              <Skeleton width="60px" height="1.5rem" className="rounded-pill" />
              <Skeleton width="80px" height="2.25rem" className="rounded" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Dashboard stats skeleton
export const StatsSkeleton = () => (
  <div className="row mb-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="col-md-3 mb-3">
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center p-4">
            <Skeleton width="48px" height="48px" className="rounded-circle mx-auto mb-3" />
            <Skeleton width="60%" height="2rem" className="mx-auto mb-2" />
            <Skeleton width="80%" height="1rem" className="mx-auto" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Chart skeleton
export const ChartSkeleton = ({ height = '300px' }) => (
  <div className="card border-0 shadow-sm">
    <div className="card-header bg-transparent">
      <Skeleton width="40%" height="1.25rem" />
    </div>
    <div className="card-body">
      <div 
        className="d-flex align-items-end justify-content-around"
        style={{ height }}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton 
            key={index}
            width="40px" 
            height={`${Math.random() * 80 + 20}%`}
            className="rounded-top"
          />
        ))}
      </div>
    </div>
  </div>
);

// List skeleton
export const ListSkeleton = ({ items = 5 }) => (
  <div className="list-group">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="list-group-item border-0 py-3">
        <div className="d-flex align-items-center">
          <Skeleton width="40px" height="40px" className="rounded me-3" />
          <div className="flex-grow-1">
            <Skeleton width="70%" height="1.25rem" className="mb-2" />
            <Skeleton width="50%" height="1rem" />
          </div>
          <Skeleton width="80px" height="2rem" className="rounded" />
        </div>
      </div>
    ))}
  </div>
);

// Form skeleton
export const FormSkeleton = () => (
  <div className="card border-0 shadow-sm">
    <div className="card-header bg-transparent">
      <Skeleton width="30%" height="1.5rem" />
    </div>
    <div className="card-body">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="mb-3">
          <Skeleton width="25%" height="1rem" className="mb-2" />
          <Skeleton width="100%" height="2.5rem" className="rounded" />
        </div>
      ))}
      <div className="d-flex justify-content-end gap-2 mt-4">
        <Skeleton width="80px" height="2.5rem" className="rounded" />
        <Skeleton width="100px" height="2.5rem" className="rounded" />
      </div>
    </div>
  </div>
);

// Navigation skeleton
export const NavSkeleton = () => (
  <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm mb-4">
    <div className="container-fluid px-4">
      <div className="d-flex align-items-center">
        <Skeleton width="150px" height="2rem" className="me-4" />
        <div className="d-flex gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} width="80px" height="1.5rem" className="rounded-pill" />
          ))}
        </div>
      </div>
      <Skeleton width="200px" height="2.5rem" className="rounded" />
    </div>
  </nav>
);

export default Skeleton; 
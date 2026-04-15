import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PropTypes from 'prop-types';

/**
 * ProtectedRoute component that requires authentication.
 * Redirects to login page if user is not authenticated.
 *
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to render if authenticated
 * @param {string|string[]} props.roles - Required role(s) to access the route
 * @param {boolean} props.requireVerification - Whether email verification is required
 */
const ProtectedRoute = ({ children, roles, requireVerification = false }) => {
  const { user, loading, isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (roles && !hasRole(roles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Check email verification if required
  if (requireVerification && !user?.is_verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Email Verification Required</h1>
          <p className="text-gray-600 mb-6">
            Please verify your email address to access this feature.
          </p>
          <button
            onClick={() => window.location.href = '/resend-verification'}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Resend Verification Email
          </button>
        </div>
      </div>
    );
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  requireVerification: PropTypes.bool,
};

export default ProtectedRoute;

/**
 * AdminRoute component that requires admin role.
 */
export const AdminRoute = ({ children }) => (
  <ProtectedRoute roles="admin">{children}</ProtectedRoute>
);

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * InstructorRoute component that requires instructor or admin role.
 */
export const InstructorRoute = ({ children }) => (
  <ProtectedRoute roles={['instructor', 'admin']}>{children}</ProtectedRoute>
);

InstructorRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
}

/**
 * Route guard that redirects users to profile page if profile is not completed
 * Only applies to authenticated users who haven't completed their profile
 */
export const ProfileCompletionGuard = ({ children }: ProfileCompletionGuardProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Skip guard if not authenticated
    if (!isAuthenticated || !user) {
      return;
    }

    // Allow access to profile page, login, register, verify-email, and logout
    const allowedPaths = [
      '/profile',
      '/settings/profile',
      '/login',
      '/register',
      '/verify-email',
      '/logout'
    ];

    const isAllowedPath = allowedPaths.some(path =>
      location.pathname.startsWith(path)
    );

    // Profile completion guard disabled - users can freely navigate
    // They will see a banner on profile page to complete their profile
  }, [user, isAuthenticated, location.pathname, navigate]);

  return <>{children}</>;
};

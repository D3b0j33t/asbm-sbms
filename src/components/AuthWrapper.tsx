
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

type AuthWrapperProps = {
  children: ReactNode;
  roles?: string[];
};

const AuthWrapper = ({ children, roles = [] }: AuthWrapperProps) => {
  const { user, isAuthenticated } = useAuth();
  
  // While checking authentication status, show a loading spinner
  if (!isAuthenticated && user === null) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If roles are specified and user doesn't have required role, redirect
  if (roles.length > 0 && user) {
    const userRole = user.role || 'user'; // Default to 'user' if no role specified
    if (!roles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  // If authenticated and has required role (or no role requirements), render children
  return <>{children}</>;
};

export default AuthWrapper;

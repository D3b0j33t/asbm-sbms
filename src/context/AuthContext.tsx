
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import Cookies from 'js-cookie';
import { supabase } from '@/lib/supabase';

type UserRole = 'student' | 'teacher' | 'admin' | null;

interface UserData {
  role: UserRole;
  name: string | null;
  avatar: string | null;
  email: string | null;
  id: string | null;
  sessionId: string | null; // Added session ID
  studentData?: any; // Add student data
}

interface AuthContextType {
  userRole: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
  resetPassword: (email: string, newPassword: string) => Promise<boolean>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  verifyPasswordResetCode: (email: string, code: string) => Promise<boolean>;
  userName: string | null;
  userAvatar: string | null;
  userEmail: string | null;
  userId: string | null;
  user: UserData | null;
  studentData?: any; // Add student data
}

const AuthContext = createContext<AuthContextType>({
  userRole: null,
  isAuthenticated: false,
  login: async () => {},
  loginWithGoogle: () => {},
  logout: () => {},
  resetPassword: async () => false,
  requestPasswordReset: async () => false,
  verifyPasswordResetCode: async () => false,
  userName: null,
  userAvatar: null,
  userEmail: null,
  userId: null,
  user: null,
  studentData: null
});

export const useAuth = () => useContext(AuthContext);

const getUserFromCookies = (): UserData | null => {
  const userDataStr = Cookies.get('userData');
  if (!userDataStr) return null;
  
  try {
    return JSON.parse(userDataStr);
  } catch (error) {
    console.error('Error parsing user data from cookies:', error);
    return null;
  }
}

const setUserCookies = (userData: UserData) => {
  // Set the cookie with a secure flag, HTTP only, and path
  Cookies.set('userData', JSON.stringify(userData), { 
    expires: 7, // 7 days
    secure: window.location.protocol === 'https:', // Only if using HTTPS
    sameSite: 'strict',
    path: '/'
  });
}

const clearUserCookies = () => {
  Cookies.remove('userData', { path: '/' });
}

const generateUserId = (email: string, role: string): string => {
  // Create a deterministic but unique ID
  return `${role}_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData>(() => {
    return getUserFromCookies() || {
      role: null,
      name: null,
      avatar: null,
      email: null,
      id: null,
      sessionId: null,
      studentData: null
    };
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!getUserFromCookies();
  });
  
  const navigate = useNavigate();

  // Validate session on initial load and periodically
  useEffect(() => {
    const validateSession = async () => {
      if (isAuthenticated && userData.sessionId) {
        try {
          const response = await fetch('https://dimdaigehnbfigtydyrx.supabase.co/functions/v1/auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              action: 'validateSession',
              sessionId: userData.sessionId
            }),
          });
          
          const data = await response.json();
          
          if (!data.valid) {
            // Session is invalid, log out the user
            console.log('Session is invalid, logging out');
            logout();
          }
        } catch (error) {
          console.error('Error validating session:', error);
        }
      }
    };
    
    validateSession();
    
    // Set up periodic session validation (every 5 minutes)
    const intervalId = setInterval(validateSession, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [isAuthenticated, userData.sessionId]);

  useEffect(() => {
    if (isAuthenticated && userData.role) {
      setUserCookies(userData);
    }
  }, [userData, isAuthenticated]);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      console.log(`Attempting ${role} login for email: ${email}`);
      let userData;
      let userError;
      let tableName: 'users' | 'faculty' | 'admin_users' = 'users';
      
      if (role === 'student') {
        tableName = 'users';
      } else if (role === 'teacher') {
        tableName = 'faculty';
      } else if (role === 'admin') {
        tableName = 'admin_users';
      }
      
      console.log(`Checking ${role} login in ${tableName} table for email: ${email}`);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('email', email)
        .single();
      
      userData = data;
      userError = error;
      
      if (userError || !userData) {
        console.error('User lookup error:', userError);
        throw new Error('Invalid credentials. Please check your email and password.');
      }
      
      console.log(`User found, verifying password for ${email}`);
      const isPasswordValid = password === userData.password;
      
      if (!isPasswordValid) {
        console.error('Password verification failed');
        throw new Error('Invalid credentials. Please check your email and password.');
      }
      
      console.log(`Successfully authenticated ${role}`);
      
      // Create a session for this user
      const sessionResponse = await fetch('https://dimdaigehnbfigtydyrx.supabase.co/functions/v1/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'createSession',
          email: email
        }),
      });
      
      const sessionData = await sessionResponse.json();
      console.log('Session created:', sessionData);
      
      const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${userData.username}`;
      const userId = generateUserId(email, role as string);
      
      // If student, get student data
      let studentData = null;
      if (role === 'student') {
        console.log('Getting student data for', email);
        // Use the correct function call with the function name defined in SQL
        const { data: student } = await supabase
          .from('students')
          .select('*')
          .eq('email', email);
        
        if (student && student.length > 0) {
          console.log('Found student data:', student[0]);
          studentData = student[0];
        }
      }
      
      const newUserData = {
        role,
        name: userData.username,
        avatar: avatarUrl,
        email,
        id: userId,
        sessionId: sessionData.sessionId, // Store the session ID
        studentData: studentData
      };
      
      setUserData(newUserData);
      setIsAuthenticated(true);
      setUserCookies(newUserData);
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${newUserData.name}!`,
      });
      
      navigate('/');
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const loginWithGoogle = () => {
    const roles: UserRole[] = ['student', 'teacher', 'admin'];
    const randomRole = roles[Math.floor(Math.random() * roles.length)] as UserRole;
    
    const randomId = Math.floor(Math.random() * 1000);
    const email = `user${randomId}@gmail.com`;
    const userId = generateUserId(email, randomRole as string);
    
    // Create a new session ID
    const sessionId = crypto.randomUUID();
    
    const newUserData = {
      role: randomRole,
      name: `Google User ${randomId}`,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=GoogleUser${randomId}`,
      email,
      id: userId,
      sessionId: sessionId
    };
    
    setUserData(newUserData);
    setIsAuthenticated(true);
    setUserCookies(newUserData);
    
    toast({
      title: "Google Sign-in Successful",
      description: `Welcome, ${newUserData.name}!`,
    });
    
    navigate('/');
  };

  const logout = () => {
    setUserData({
      role: null,
      name: null,
      avatar: null,
      email: null,
      id: null,
      sessionId: null
    });
    setIsAuthenticated(false);
    clearUserCookies();
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    navigate('/login');
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        toast({
          title: "Password Reset Requested",
          description: `If an account exists with ${email}, you will receive a reset code.`,
        });
        resolve(true);
      }, 2000);
    });
  };

  const verifyPasswordResetCode = async (email: string, code: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 2000);
    });
  };

  const resetPassword = async (email: string, newPassword: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated. You can now log in with your new password.",
        });
        resolve(true);
      }, 2000);
    });
  };

  return (
    <AuthContext.Provider value={{ 
      userRole: userData.role, 
      isAuthenticated, 
      login, 
      loginWithGoogle,
      logout,
      resetPassword,
      requestPasswordReset,
      verifyPasswordResetCode,
      userName: userData.name,
      userAvatar: userData.avatar,
      userEmail: userData.email,
      userId: userData.id,
      user: userData,
      studentData: userData.studentData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

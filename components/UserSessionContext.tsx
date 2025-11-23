// context/UserSessionContext.tsx
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface User {
  id: string; // UUID as string
  name: string;
  email: string;
  permissions: string[];
  roles?: any[]; // roles could be added to the user object
  organizations?: {
    id: string; // UUID as string
    name: string;
    description: string | null;
  }[];
}

interface UserSessionContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Get organization ID from URL parameters or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const urlOrgId = urlParams.get('organizationId');
        const storedOrgId = localStorage.getItem('selectedOrganization');

        // Build the session API URL with organization parameter if available
        const orgId = urlOrgId || storedOrgId;
        const sessionUrl = orgId ? `/api/auth/session?organizationId=${orgId}` : '/api/auth/session';

        const response = await fetch(sessionUrl);
        const data = await response.json();

        if (data.authenticated) {
          // Update user state with complete user data from the session API
          setUser(data.user);
          // Store in localStorage for fallback
          localStorage.setItem('user', JSON.stringify(data.user));

          // If organization ID was specified in the URL, make sure it's stored
          if (orgId) {
            localStorage.setItem('selectedOrganization', orgId);
          }
        } else {
          // If not authenticated, clear any stored user
          localStorage.removeItem('user');
          localStorage.removeItem('selectedOrganization');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        // If API fails, try to load from localStorage as a fallback
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          } catch (parseError) {
            console.error('Error parsing user data from localStorage:', parseError);
            localStorage.removeItem('user');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    // Store the first organization as the selected one if available
    if (userData.organizations && userData.organizations.length > 0) {
      localStorage.setItem('selectedOrganization', userData.organizations[0].id.toString());
    }
  };

  const logout = async () => {
    try {
      // Call the API to clear the session cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local state and localStorage
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('selectedOrganization');
      // Redirect to auth page
      window.location.href = '/auth';
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <UserSessionContext.Provider value={value}>
      {children}
    </UserSessionContext.Provider>
  );
}

export function useUserSession() {
  const context = useContext(UserSessionContext);
  if (context === undefined) {
    throw new Error('useUserSession must be used within a UserSessionProvider');
  }
  return context;
}
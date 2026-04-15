// context/UserSessionContext.tsx
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

export interface User {
  id?: string;
  name?: string;
  email: string;
  permissions?: string[];
  roles?: any[];
  organizations?: any[];
  contact: any | null;
  accounts: any[];
  accountId?: string;
  Id?: string; // Contact Id
  user_details?: any;
  role?: string;
}

interface UserSessionContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  selectedAccount: any | null;
  setSelectedAccountId: (id: string) => void;
}

const UserSessionContext = createContext<UserSessionContextType | undefined>(undefined);

export function UserSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountStateId] = useState<string | null>(null);

  // Derived selectedAccount based on the id
  const selectedAccount = React.useMemo(() => {
    if (!user || (!user.accounts && !user.organizations)) return null;
    const allAccounts = user.accounts || [];
    return allAccounts.find(a => (a.Id || a.id) === selectedAccountId) || allAccounts[0] || null;
  }, [user, selectedAccountId]);

  const setSelectedAccountId = async (id: string): Promise<void> => {
    setSelectedAccountStateId(id);
    localStorage.setItem('selectedAccount', id);

    // Persist to server session
    try {
      await fetch('/api/auth/update-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: id, contactId: user?.Id || user?.contact?.Id })
      });
      console.log('[UserSessionContext] Server session updated to account:', id);
    } catch (error) {
      console.error('[UserSessionContext] Failed to update server session:', error);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        if (data.authenticated) {
          console.log('[UserSessionContext] Session loaded successfully:', data.user);
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));

          // Store the first account as selected if available and not already set
          const storedAccountId = localStorage.getItem('selectedAccount');
          if (storedAccountId) {
            setSelectedAccountStateId(storedAccountId);
          } else if (data.user.accounts && data.user.accounts.length > 0) {
            const directAccount = data.user.accounts.find((a: any) => a.isdirect === true || a.isdirect === 'true');
            const defaultId = directAccount?.Id || directAccount?.id || data.user.accounts[0].Id || data.user.accounts[0].id || '';
            setSelectedAccountId(defaultId);
          }
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('selectedAccount');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        // If API fails, try to load from localStorage as a fallback
        const storedUser = localStorage.getItem('user');
        const storedAccountId = localStorage.getItem('selectedAccount');
        if (storedAccountId) setSelectedAccountStateId(storedAccountId);

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

    // Store the direct account as the selected one if available, otherwise the first one
    if (userData.accounts && userData.accounts.length > 0) {
      const directAccount = userData.accounts.find((a: any) => a.isdirect === true || a.isdirect === 'true');
      const defaultId = directAccount?.Id || directAccount?.id || userData.accounts[0].Id || userData.accounts[0].id || '';
      setSelectedAccountId(defaultId);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setUser(null);
      setSelectedAccountStateId(null);
      localStorage.removeItem('user');
      localStorage.removeItem('selectedAccount');
      window.location.href = '/auth';
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    selectedAccount,
    setSelectedAccountId
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
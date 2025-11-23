"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useUserSession } from './UserSessionContext';
import { usePermissions } from './PermissionContext';

interface HeaderProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
}

export default function Header({ mobileOpen, setMobileOpen, isCollapsed }: HeaderProps) {
  const pathname = usePathname();
  const { user, logout } = useUserSession();
  const { permissions: userPermissions, isSuperAdmin } = usePermissions();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<number | null>(null);

  // Get the login function to update user context when organization changes
  const { login } = useUserSession();

  // Set selected organization from localStorage or default when user loads
  useEffect(() => {
    if (user && user.organizations && user.organizations.length > 0) {
      // First try to get selected organization from localStorage
      const storedOrgId = localStorage.getItem('selectedOrganization');
      if (storedOrgId) {
        const orgId = parseInt(storedOrgId, 10);
        // Verify that the stored organization ID exists in user's organizations
        const orgExists = user.organizations.some(org => org.id === orgId);
        if (orgExists) {
          setSelectedOrganization(orgId);
          return; // Early return to avoid setting default
        }
      }

      // If no stored organization or it doesn't exist, use the first one
      if (!selectedOrganization) {
        setSelectedOrganization(user.organizations[0].id);
      }
    }
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const orgDropdown = document.querySelector('.org-dropdown');
      const userDropdown = document.querySelector('.user-dropdown');
      
      if (isOrgDropdownOpen && orgDropdown && !orgDropdown.contains(target)) {
        setIsOrgDropdownOpen(false);
      }
      
      if (isUserDropdownOpen && userDropdown && !userDropdown.contains(target)) {
        setIsUserDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOrgDropdownOpen, isUserDropdownOpen]);

  // compute current page name from pathname
  const getCurrentPageName = () => {
    const pathSegments = pathname?.split("/").filter(Boolean) || [];
    if (pathSegments.length === 0) return "Dashboard";
    return pathSegments[0].charAt(0).toUpperCase() + pathSegments[0].slice(1);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Mobile hamburger (left) */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Bars3Icon className="h-6 w-6 text-gray-600" />
          </button>

          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{getCurrentPageName()}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Organization selector dropdown */}
          {user?.organizations && user.organizations.length > 0 && (
            <div className="relative org-dropdown">
              <button
                onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                  {user.organizations.find(org => org.id === selectedOrganization)?.name || user.organizations[0].name}
                </span>
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Organization dropdown menu */}
              {isOrgDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                      Organizations
                    </p>
                    <div className="space-y-1">
                      {user.organizations.map((org) => (
                        <button
                          key={org.id}
                          className={`block w-full text-left px-2 py-1 text-sm rounded ${
                            selectedOrganization === org.id 
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                          }`}
                          onClick={async (e) => {
                            e.stopPropagation();
                            setIsOrgDropdownOpen(false); // Close dropdown after selection

                            try {
                              console.log('Attempting to update session for organization:', org.id);

                              // First, update the session cookie with the selected organization
                              const sessionUpdateResponse = await fetch('/api/auth/update-session', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ organizationId: org.id }),
                              });

                              console.log('Session update response status:', sessionUpdateResponse.status);

                              if (!sessionUpdateResponse.ok) {
                                const errorText = await sessionUpdateResponse.text();
                                console.error('Failed to update session with new organization:', errorText);
                              } else {
                                const responseData = await sessionUpdateResponse.json();
                                console.log('Session updated successfully with organization:', org.id, responseData);
                              }

                              // Set the organization in localStorage for persistence
                              localStorage.setItem('selectedOrganization', org.id.toString());

                              // Redirect to the current page with organization parameter to refresh context
                              // Properly handle existing query parameters
                              const currentUrl = new URL(window.location.href);
                              currentUrl.searchParams.set('organizationId', org.id.toString());
                              window.location.href = '/dashboard';
                            } catch (error) {
                              console.error('Error switching organization:', error);
                            }
                          }}
                        >
                          {org.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>

          <div className="relative user-dropdown">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {user ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </button>

            {/* User profile dropdown menu */}
            {isUserDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.name || 'User Name'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <button
                  onClick={async () => await logout()}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
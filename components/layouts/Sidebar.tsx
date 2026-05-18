"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useUserSession } from '../UserSessionContext';
import { usePermissions } from '../PermissionContext';
import Header from '../Header';
import { MANUFACTURER_GROUP } from "@/lib/permissions";

interface SidebarProps {
  children: React.ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  visibleFor?: string[]; // e.g. ['Customer', 'Partner', 'Hybrid']. If omitted, visible to all
}

const navigation: NavigationItem[] = [
  {
    name: "Home", href: "/home", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ), visibleFor: ["Customer", "Hybrid"]
  },
  {
    name: "Catalog", href: "/products", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  },
  {
    name: "My Inventory", href: "/inventory", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ), visibleFor: ["Customer", "Hybrid"]
  },
  {
    name: "Orders", href: "/orders", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ), visibleFor: ["Customer", "Hybrid"]
  },
  {
    name: "Proposals", href: "/proposals", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ), visibleFor: ["Customer", "Hybrid"]
  },
  {
    name: "Quotes", href: "/quotes", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ), visibleFor: ["Customer", "Hybrid"]
  },
  {
    name: "Purchase Orders", href: "/purchase-orders", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ), visibleFor: ["Partner", "Hybrid"]
  },
  {
    name: "Supplier Bills", href: "/supplier-bills", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ), visibleFor: ["Partner", "Hybrid"]
  },
  {
    name: "Shipments", href: "/shipments", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ), visibleFor: ["Customer", "Hybrid"]
  },
  {
    name: "Invoices", href: "/invoices", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ), visibleFor: ["Customer", "Hybrid"]
  },
  {
    name: "Locations", href: "/admin/authorize-locations", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    name: "Reports", href: "/reports", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    name: "Profile", href: "/profile", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },


  {
    name: "Users", href: "/admin/users", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ), visibleFor: ["Partner", "Hybrid", "Customer"]
  },

];


export default function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();
  const { user, selectedAccount, logout } = useUserSession();
  const { isSuperAdmin } = usePermissions();
  const [isCollapsed, setIsCollapsed] = useState(false); // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer
  // close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // close mobile drawer on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);



  const accountType = selectedAccount?.Account_Record_Type__c || 'Customer';
  const isManufacturerGroup = MANUFACTURER_GROUP.includes(accountType);
  const isCustomerType = accountType === 'Customer' || accountType === 'NSO' || accountType === 'Hybrid';
  
  let landingPage = isCustomerType ? '/home' : '/products';
  if (isManufacturerGroup) landingPage = '/products';
  if (user?.role === 'Super Admin' || user?.role === 'Admin') {
    landingPage = '/admin-portal/organizations';
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Mobile overlay (when drawer open) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar (visible from md and up) */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-40 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"
          }`}
      >
        {/* Logo + Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 min-w-0">
          {!isCollapsed && (
            <Link href={landingPage} className="flex items-center">
              <span className="text-2xl font-bold text-primary dark:text-primary">GTH</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed((s) => !s)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${isCollapsed ? "-rotate-180" : "rotate-0"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {user?.role === 'Super Admin' || user?.role === 'Admin' ? (
              <li>
                <Link
                  href="/admin-portal/organizations"
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors group ${pathname === '/admin-portal/organizations'
                    ? "bg-blue-50 text-primary dark:bg-blue-900/50 dark:text-blue-400"
                    : "text-gray-700 hover:bg-blue-50 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    }`}
                  title={isCollapsed ? "Organizations" : undefined}
                >
                  <span className="flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </span>
                  {!isCollapsed && <span className="ml-3 text-sm font-medium">Organizations</span>}
                </Link>
              </li>
            ) : navigation.map((item) => {
              const accountType = selectedAccount?.Account_Record_Type__c || 'Customer';
              const typeCategory = (accountType === 'Customer' || accountType === 'NSO') ? 'Customer' :
                (accountType === 'Hybrid') ? 'Hybrid' :
                MANUFACTURER_GROUP.includes(accountType) ? 'Partner' : 'Partner';

              const hasPermission = !item.visibleFor || item.visibleFor.includes(typeCategory);

              if (!hasPermission) {
                return null; // Don't render this item if user doesn't have permission
              }

              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  {item.name === "Admin" && (
                    <div className="my-4 border-t border-gray-200 mx-3" />
                  )}
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors group ${isActive
                      ? "bg-blue-50 text-primary dark:bg-blue-900/50 dark:text-blue-400"
                      : "text-gray-700 hover:bg-blue-50 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!isCollapsed && <span className="ml-3 text-sm font-medium">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - profile / settings */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {user ? (
            <div className="flex items-center justify-between min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                {!isCollapsed && <div className="text-sm">{user.name || 'User'}</div>}
              </div>
              {!isCollapsed && (
                <button
                  onClick={async () => await logout()}
                  className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">U</div>
              {!isCollapsed && <div className="text-sm">User Name</div>}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer (md:hidden) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 md:hidden w-64 bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-72"
          }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <Link href={landingPage} className="flex items-center">
            <span className="text-xl font-bold text-primary dark:text-primary">GTH</span>
          </Link>
          <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2">
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {user?.role === 'Super Admin' || user?.role === 'Admin' ? (
              <li>
                <Link
                  href="/admin-portal/organizations"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors group ${pathname === '/admin-portal/organizations'
                    ? "bg-blue-50 text-primary dark:bg-blue-900/50 dark:text-blue-400"
                    : "text-gray-700 hover:bg-blue-50 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    }`}
                >
                  <span className="flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </span>
                  <span className="ml-3 text-sm font-medium">Organizations</span>
                </Link>
              </li>
            ) : navigation.map((item) => {
              const accountType = selectedAccount?.Account_Record_Type__c || 'Customer';
              const typeCategory = (accountType === 'Customer' || accountType === 'NSO') ? 'Customer' :
                (accountType === 'Hybrid') ? 'Hybrid' :
                MANUFACTURER_GROUP.includes(accountType) ? 'Partner' : 'Partner';

              const hasPermission = !item.visibleFor || item.visibleFor.includes(typeCategory);

              if (!hasPermission) {
                return null; // Don't render this item if user doesn't have permission
              }

              return (
                <li key={item.name}>
                  {item.name === "Admin" && (
                    <div className="my-4 border-t border-gray-200 mx-3" />
                  )}
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors group ${pathname === item.href
                      ? "bg-blue-50 text-primary dark:bg-blue-900/50 dark:text-blue-400"
                      : "text-gray-700 hover:bg-blue-50 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      }`}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    <span className="ml-3 text-sm font-medium">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 min-w-0 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <Header mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} isCollapsed={isCollapsed} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

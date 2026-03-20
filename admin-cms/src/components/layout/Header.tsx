"use client";

import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/destinations', label: 'Destinations' },
  { path: '/hotels', label: 'Hotels' },
  { path: '/transports', label: 'Transports' },
  { path: '/bookings', label: 'Bookings' },
  { path: '/users', label: 'Users' },
  { path: '/settings', label: 'App Settings' },
  { path: '/ai-logs', label: 'AI Logs' },
];

function getPageTitle(pathname: string): string {
  const match = NAV_ITEMS.find(
    (item) => pathname === item.path || pathname.startsWith(item.path + '/'),
  );
  return match?.label ?? 'Admin CMS';
}

export function Header() {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  const title = getPageTitle(pathname);

  return (
    <header className="flex items-center justify-between h-14 px-6 bg-white border-b border-slate-200 flex-shrink-0">
      <h1 className="text-lg font-semibold text-slate-800">{title}</h1>

      <div className="flex items-center gap-4">
        {/* User Info */}
        {user && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User size={16} />
            <span className="hidden sm:inline">{user.fullName || user.email}</span>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors px-2 py-1 rounded hover:bg-slate-100"
          title="Sign out"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}

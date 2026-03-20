import { Link } from 'react-router-dom';
import {
  Map,
  Building2,
  Car,
  ClipboardList,
  Users,
  Bot,
  type LucideIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';

interface StatCard {
  label: string;
  icon: LucideIcon;
  href: string;
  phase: string;
}

const STAT_CARDS: StatCard[] = [
  { label: 'Destinations', icon: Map, href: '/destinations', phase: 'Phase 2' },
  { label: 'Hotels', icon: Building2, href: '/hotels', phase: 'Phase 3' },
  { label: 'Transport Services', icon: Car, href: '/transports', phase: 'Phase 4' },
  { label: 'Bookings', icon: ClipboardList, href: '/bookings', phase: 'Phase 4' },
  { label: 'Users', icon: Users, href: '/users', phase: 'Phase 4' },
  { label: 'AI Logs', icon: Bot, href: '/ai-logs', phase: 'Phase 4' },
];

const QUICK_LINKS = [
  { label: '+ New destination', href: '/destinations/new' },
  { label: '+ New hotel', href: '/hotels/new' },
  { label: '+ New transport', href: '/transports/new' },
  { label: 'View bookings', href: '/bookings' },
];

export function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Travel Assistant internal admin panel"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        {STAT_CARDS.map(({ label, icon: Icon, href, phase }) => (
          <Link
            key={href}
            to={href}
            className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3 hover:border-blue-300 hover:shadow-sm transition group"
          >
            <Icon
              size={20}
              className="text-slate-400 group-hover:text-blue-500 transition"
              strokeWidth={1.5}
            />
            <div>
              <p className="text-sm font-medium text-slate-800">{label}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{phase}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Quick access
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              to={href}
              className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Phase status */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Build status
        </p>
        <div className="space-y-2">
          {[
            { phase: 'Phase 1', desc: 'App skeleton, auth, layout, navigation', done: true },
            { phase: 'Phase 2', desc: 'Destinations CRUD (list, create, edit, sub-tables)', done: false },
            { phase: 'Phase 3', desc: 'Hotels CRUD (rooms, amenities, badges, reviews)', done: false },
            { phase: 'Phase 4', desc: 'Transport, Bookings, Users, Settings, AI Logs', done: false },
          ].map(({ phase, desc, done }) => (
            <div key={phase} className="flex items-center gap-3 text-sm">
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${done ? 'bg-green-500' : 'bg-slate-300'}`}
              />
              <span className="font-medium text-slate-700 w-16">{phase}</span>
              <span className="text-slate-500 text-xs">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

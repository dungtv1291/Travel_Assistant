import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { NAV_GROUPS } from '@/constants';

export function Sidebar() {
  return (
    <aside className="flex flex-col w-60 h-full bg-slate-900 text-slate-200 flex-shrink-0 select-none">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-slate-700/50 flex-shrink-0">
        <span className="text-blue-400 text-lg leading-none">✈</span>
        <div>
          <p className="text-sm font-semibold text-white leading-tight tracking-wide">
            Travel Assistant
          </p>
          <p className="text-[11px] text-slate-500 leading-tight">Admin CMS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map(({ label, items }) => (
          <div key={label || '__root'}>
            {label && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {label}
              </p>
            )}
            <div className="space-y-0.5">
              {items.map(({ path, label: itemLabel, icon: Icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-100',
                      isActive
                        ? 'bg-blue-600 text-white font-medium'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
                    )
                  }
                >
                  <Icon size={15} strokeWidth={1.75} className="flex-shrink-0" />
                  {itemLabel}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-700/50 flex-shrink-0">
        <p className="text-[11px] text-slate-600">Internal use only</p>
      </div>
    </aside>
  );
}


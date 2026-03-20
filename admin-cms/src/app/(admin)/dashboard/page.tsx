import { Topbar } from "@/components/layout/Topbar";

// Stat card data — values are fetched from the backend in a real implementation.
// For Phase 1 these are static placeholders; future phases will add server fetch.
const STAT_CARDS = [
  { label: "Destinations", value: "—", icon: "🗺", href: "/destinations" },
  { label: "Hotels", value: "—", icon: "🏨", href: "/hotels" },
  { label: "Transport services", value: "—", icon: "🚗", href: "/transports" },
  { label: "Open bookings", value: "—", icon: "📋", href: "/bookings" },
  { label: "Registered users", value: "—", icon: "👤", href: "/users" },
];

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" />

      <div className="mt-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {STAT_CARDS.map(({ label, value, icon }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-col gap-2"
            >
              <span className="text-2xl">{icon}</span>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">
            Quick access
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Add destination", href: "/destinations/new" },
              { label: "Add hotel", href: "/hotels/new" },
              { label: "Add transport", href: "/transports/new" },
              { label: "Manage bookings", href: "/bookings" },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Placeholder notice */}
        <p className="text-xs text-slate-400">
          Phase 1 — skeleton only. Stats and live data will be populated in
          later phases when admin API endpoints are added to the backend.
        </p>
      </div>
    </>
  );
}

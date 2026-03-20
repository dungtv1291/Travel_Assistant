import { Topbar } from "@/components/layout/Topbar";
import Link from "next/link";

export default function DestinationsPage() {
  return (
    <>
      <Topbar title="Destinations" />
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">All Destinations</h2>
        <Link
          href="/destinations/new"
          className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 transition"
        >
          + New destination
        </Link>
      </div>
      <div className="mt-4 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
        Destination list — Phase 2
      </div>
    </>
  );
}

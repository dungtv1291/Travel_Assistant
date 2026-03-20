import { Topbar } from "@/components/layout/Topbar";
import Link from "next/link";

export default function NewDestinationPage() {
  return (
    <>
      <Topbar title="New Destination" />
      <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/destinations" className="hover:text-slate-700">
          Destinations
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">New</span>
      </div>
      <div className="mt-4 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
        Destination create form — Phase 2
      </div>
    </>
  );
}

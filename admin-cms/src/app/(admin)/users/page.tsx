import { Topbar } from "@/components/layout/Topbar";

export default function UsersPage() {
  return (
    <>
      <Topbar title="Users" />
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-800">Registered Users</h2>
      </div>
      <div className="mt-4 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
        User list with active/inactive toggle — Phase 4
      </div>
    </>
  );
}

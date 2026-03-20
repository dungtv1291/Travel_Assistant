import { Topbar } from "@/components/layout/Topbar";

export default function SettingsPage() {
  return (
    <>
      <Topbar title="App Settings" />
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-800">App Settings</h2>
        <p className="text-sm text-slate-500 mt-1">
          Key-value configuration stored in the <code>app_settings</code> table.
        </p>
      </div>
      <div className="mt-4 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
        App settings key-value editor — Phase 4
      </div>
    </>
  );
}

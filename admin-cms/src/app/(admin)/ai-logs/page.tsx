import { Topbar } from "@/components/layout/Topbar";

export default function AiLogsPage() {
  return (
    <>
      <Topbar title="AI Generation Logs" />
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-slate-800">AI Generation Logs</h2>
        <p className="text-sm text-slate-500 mt-1">
          Read-only monitoring of AI feature usage and errors.
        </p>
      </div>
      <div className="mt-4 bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
        AI log table — Phase 4
      </div>
    </>
  );
}

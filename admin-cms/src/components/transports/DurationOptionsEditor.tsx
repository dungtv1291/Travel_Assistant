// ─── Duration Options editor ────────────────────────────────────────────────
// Inline CRUD panel for transport_duration_options.

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { transportDurationOptionsService } from '@/services/transports.service';
import { getErrorMessage } from '@/lib/api';
import type { TransportDurationOption } from '@/types';

interface DurationOptionsEditorProps {
  transportId: number;
}

type DurationOptionDraft = {
  transport_service_id: number;
  value: string;
  label_ko: string;
  label_en: string;
  label_vi: string;
  price_amount: string;
  currency: string;
  sort_order: number;
};

function emptyDraft(transportId: number): DurationOptionDraft {
  return {
    transport_service_id: transportId,
    value: '',
    label_ko: '',
    label_en: '',
    label_vi: '',
    price_amount: '',
    currency: 'KRW',
    sort_order: 0,
  };
}

function optionToDraft(o: TransportDurationOption): DurationOptionDraft {
  return {
    transport_service_id: o.transport_service_id,
    value: String(o.value),
    label_ko: o.label_ko,
    label_en: o.label_en,
    label_vi: o.label_vi,
    price_amount: String(o.price_amount),
    currency: o.currency,
    sort_order: o.sort_order,
  };
}

function coerceDraft(draft: DurationOptionDraft) {
  return {
    transport_service_id: draft.transport_service_id,
    value: parseInt(draft.value) || 1,
    label_ko: draft.label_ko,
    label_en: draft.label_en,
    label_vi: draft.label_vi,
    price_amount: parseInt(draft.price_amount) || 0,
    currency: draft.currency || 'KRW',
    sort_order: draft.sort_order,
  };
}

export function DurationOptionsEditor({ transportId }: DurationOptionsEditorProps) {
  const [options, setOptions] = useState<TransportDurationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<DurationOptionDraft>(emptyDraft(transportId));
  const [editSaving, setEditSaving] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [addDraft, setAddDraft] = useState<DurationOptionDraft>(emptyDraft(transportId));
  const [addSaving, setAddSaving] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transportId]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const result = await transportDurationOptionsService.list({
        transport_service_id: transportId,
        limit: 200,
      });
      setOptions(result.items);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // ── Add ──────────────────────────────────────────────────────────────────

  function startAdd() {
    setAddDraft(emptyDraft(transportId));
    setShowAdd(true);
    setEditingId(null);
  }

  async function submitAdd() {
    if (!addDraft.label_en.trim()) return;
    setAddSaving(true);
    try {
      await transportDurationOptionsService.create(coerceDraft(addDraft));
      setShowAdd(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAddSaving(false);
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────

  function startEdit(opt: TransportDurationOption) {
    setShowAdd(false);
    setEditingId(opt.id);
    setEditDraft(optionToDraft(opt));
  }

  async function submitEdit(optId: number) {
    setEditSaving(true);
    try {
      await transportDurationOptionsService.update(optId, coerceDraft(editDraft));
      setEditingId(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  async function handleDelete(opt: TransportDurationOption) {
    if (!window.confirm(`Delete duration option "${opt.label_en}"?`)) return;
    try {
      await transportDurationOptionsService.delete(opt.id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  // ── Row form ─────────────────────────────────────────────────────────────

  function DraftForm({
    draft,
    set,
    saving,
    onSave,
    onCancel,
    saveLabel,
  }: {
    draft: DurationOptionDraft;
    set: (fn: (d: DurationOptionDraft) => DurationOptionDraft) => void;
    saving: boolean;
    onSave: () => void;
    onCancel: () => void;
    saveLabel: string;
  }) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Label (KO)"
            value={draft.label_ko}
            onChange={(e) => set((d) => ({ ...d, label_ko: e.target.value }))}
            placeholder="1일"
          />
          <Input
            label="Label (EN)"
            value={draft.label_en}
            onChange={(e) => set((d) => ({ ...d, label_en: e.target.value }))}
            placeholder="1 day"
          />
          <Input
            label="Label (VI)"
            value={draft.label_vi}
            onChange={(e) => set((d) => ({ ...d, label_vi: e.target.value }))}
            placeholder="1 ngày"
          />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <Input
            label="Value (days)"
            type="number"
            min="1"
            step="1"
            className="w-28"
            value={draft.value}
            onChange={(e) => set((d) => ({ ...d, value: e.target.value }))}
            placeholder="1"
          />
          <Input
            label="Price amount"
            type="number"
            min="0"
            step="1"
            className="w-36"
            value={draft.price_amount}
            onChange={(e) => set((d) => ({ ...d, price_amount: e.target.value }))}
            placeholder="50000"
          />
          <Input
            label="Currency"
            className="w-24"
            value={draft.currency}
            onChange={(e) => set((d) => ({ ...d, currency: e.target.value }))}
            placeholder="KRW"
          />
          <Input
            label="Sort"
            type="number"
            className="w-20"
            value={String(draft.sort_order)}
            onChange={(e) => set((d) => ({ ...d, sort_order: parseInt(e.target.value) || 0 }))}
          />
          <div className="flex gap-2 mb-0.5">
            <Button size="sm" loading={saving} onClick={onSave}>
              <Check size={13} /> {saveLabel}
            </Button>
            <Button variant="secondary" size="sm" onClick={onCancel}>
              <X size={13} /> Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Duration Options</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Rental durations with their prices (e.g. 1 day, 3 days).
          </p>
        </div>
        {!showAdd && (
          <Button variant="secondary" size="sm" onClick={startAdd}>
            <Plus size={13} /> Add option
          </Button>
        )}
      </div>

      {error && (
        <div className="mx-5 mt-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="px-5 py-6 text-sm text-slate-400">Loading…</div>
      ) : (
        <div className="divide-y divide-slate-100">
          {options.length === 0 && !showAdd && (
            <p className="px-5 py-6 text-sm text-slate-400">No duration options yet.</p>
          )}

          {options.map((opt) =>
            editingId === opt.id ? (
              <div key={opt.id} className="px-5 py-3 bg-slate-50">
                <DraftForm
                  draft={editDraft}
                  set={setEditDraft}
                  saving={editSaving}
                  onSave={() => submitEdit(opt.id)}
                  onCancel={() => setEditingId(null)}
                  saveLabel="Save"
                />
              </div>
            ) : (
              <div key={opt.id} className="flex items-center gap-4 px-5 py-2.5">
                <span className="flex-1 text-sm font-medium text-slate-800">{opt.label_en}</span>
                <span className="text-xs text-slate-500 w-16">{opt.label_ko}</span>
                <span className="text-xs text-slate-500 w-14 text-center">
                  {opt.value} day{String(opt.value) !== '1' ? 's' : ''}
                </span>
                <span className="text-xs font-medium text-slate-700 w-28 text-right">
                  {Number(opt.price_amount).toLocaleString()} {opt.currency}
                </span>
                <span className="text-xs text-slate-400 w-8 text-right">{opt.sort_order}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(opt)}>
                    <Pencil size={12} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(opt)}>
                    <Trash2 size={12} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ),
          )}

          {/* Add form */}
          {showAdd && (
            <div className="px-5 py-3 bg-blue-50 border-t border-blue-100">
              <DraftForm
                draft={addDraft}
                set={setAddDraft}
                saving={addSaving}
                onSave={submitAdd}
                onCancel={() => setShowAdd(false)}
                saveLabel="Add"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

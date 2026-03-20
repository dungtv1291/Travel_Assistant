// ─── Pickup Options editor ──────────────────────────────────────────────────
// Inline CRUD panel for transport_pickup_options.

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { ActiveBadge } from '@/components/ui/Badge';
import { transportPickupOptionsService } from '@/services/transports.service';
import { getErrorMessage } from '@/lib/api';
import type { TransportPickupOption } from '@/types';

interface PickupOptionsEditorProps {
  transportId: number;
}

type PickupOptionDraft = {
  transport_service_id: number;
  option_key: string;
  label_ko: string;
  label_en: string;
  label_vi: string;
  description_ko: string;
  description_en: string;
  description_vi: string;
  sort_order: number;
  is_active: boolean;
};

function emptyDraft(transportId: number): PickupOptionDraft {
  return {
    transport_service_id: transportId,
    option_key: '',
    label_ko: '',
    label_en: '',
    label_vi: '',
    description_ko: '',
    description_en: '',
    description_vi: '',
    sort_order: 0,
    is_active: true,
  };
}

function optionToDraft(o: TransportPickupOption): PickupOptionDraft {
  return {
    transport_service_id: o.transport_service_id,
    option_key: o.option_key,
    label_ko: o.label_ko,
    label_en: o.label_en,
    label_vi: o.label_vi,
    description_ko: o.description_ko ?? '',
    description_en: o.description_en ?? '',
    description_vi: o.description_vi ?? '',
    sort_order: o.sort_order,
    is_active: o.is_active,
  };
}

function coerceDraft(draft: PickupOptionDraft) {
  return {
    transport_service_id: draft.transport_service_id,
    option_key: draft.option_key,
    label_ko: draft.label_ko,
    label_en: draft.label_en,
    label_vi: draft.label_vi,
    description_ko: draft.description_ko || null,
    description_en: draft.description_en || null,
    description_vi: draft.description_vi || null,
    sort_order: draft.sort_order,
    is_active: draft.is_active,
  };
}

export function PickupOptionsEditor({ transportId }: PickupOptionsEditorProps) {
  const [options, setOptions] = useState<TransportPickupOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<PickupOptionDraft>(emptyDraft(transportId));
  const [editSaving, setEditSaving] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [addDraft, setAddDraft] = useState<PickupOptionDraft>(emptyDraft(transportId));
  const [addSaving, setAddSaving] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transportId]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const result = await transportPickupOptionsService.list({
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
    if (!addDraft.option_key.trim() || !addDraft.label_en.trim()) return;
    setAddSaving(true);
    try {
      await transportPickupOptionsService.create(coerceDraft(addDraft));
      setShowAdd(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAddSaving(false);
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────

  function startEdit(opt: TransportPickupOption) {
    setShowAdd(false);
    setEditingId(opt.id);
    setEditDraft(optionToDraft(opt));
  }

  async function submitEdit(optId: number) {
    setEditSaving(true);
    try {
      await transportPickupOptionsService.update(optId, coerceDraft(editDraft));
      setEditingId(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  async function handleDelete(opt: TransportPickupOption) {
    if (!window.confirm(`Delete pickup option "${opt.label_en}"?`)) return;
    try {
      await transportPickupOptionsService.delete(opt.id);
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
    draft: PickupOptionDraft;
    set: (fn: (d: PickupOptionDraft) => PickupOptionDraft) => void;
    saving: boolean;
    onSave: () => void;
    onCancel: () => void;
    saveLabel: string;
  }) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-3">
          <Input
            label="Key"
            value={draft.option_key}
            onChange={(e) => set((d) => ({ ...d, option_key: e.target.value }))}
            placeholder="airport_direct"
          />
          <Input
            label="Label (KO)"
            value={draft.label_ko}
            onChange={(e) => set((d) => ({ ...d, label_ko: e.target.value }))}
            placeholder="공항 직접 픽업"
          />
          <Input
            label="Label (EN)"
            value={draft.label_en}
            onChange={(e) => set((d) => ({ ...d, label_en: e.target.value }))}
            placeholder="Direct airport pickup"
          />
          <Input
            label="Label (VI)"
            value={draft.label_vi}
            onChange={(e) => set((d) => ({ ...d, label_vi: e.target.value }))}
            placeholder="Đón trực tiếp tại sân bay"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Textarea
            label="Description (KO)"
            rows={2}
            value={draft.description_ko}
            onChange={(e) => set((d) => ({ ...d, description_ko: e.target.value }))}
            placeholder="공항 도착 게이트에서 직접 픽업"
          />
          <Textarea
            label="Description (EN)"
            rows={2}
            value={draft.description_en}
            onChange={(e) => set((d) => ({ ...d, description_en: e.target.value }))}
            placeholder="Direct pickup from arrival gate"
          />
          <Textarea
            label="Description (VI)"
            rows={2}
            value={draft.description_vi}
            onChange={(e) => set((d) => ({ ...d, description_vi: e.target.value }))}
            placeholder="Đón trực tiếp tại cổng đến"
          />
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <Input
            label="Sort"
            type="number"
            className="w-20"
            value={String(draft.sort_order)}
            onChange={(e) => set((d) => ({ ...d, sort_order: parseInt(e.target.value) || 0 }))}
          />
          <div className="flex items-center gap-2 mb-0.5">
            <Toggle
              label="Active"
              checked={draft.is_active}
              onChange={(v) => set((d) => ({ ...d, is_active: v }))}
            />
          </div>
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
          <h3 className="text-sm font-semibold text-slate-800">Pickup Options</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pickup point choices offered for this service (e.g. Airport direct, Hotel pickup).
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
            <p className="px-5 py-6 text-sm text-slate-400">No pickup options yet.</p>
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
                <code className="text-xs text-slate-500 w-32 truncate">{opt.option_key}</code>
                <span className="flex-1 text-sm font-medium text-slate-800">{opt.label_en}</span>
                <span className="text-xs text-slate-500 w-28 truncate">{opt.label_ko}</span>
                <span className="text-xs text-slate-400 flex-1 truncate line-clamp-1">
                  {opt.description_en ?? '—'}
                </span>
                <span className="w-16">
                  <ActiveBadge active={opt.is_active} />
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

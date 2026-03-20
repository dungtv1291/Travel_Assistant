// ─── Transport Badges editor ────────────────────────────────────────────────
// Inline CRUD panel for transport_badges.
// Same UX pattern as HotelBadgesEditor.

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { transportBadgesService, type TransportBadgePayload } from '@/services/transports.service';
import { getErrorMessage } from '@/lib/api';
import type { TransportBadge } from '@/types';

interface TransportBadgesEditorProps {
  transportId: number;
}

const EMPTY_ROW: TransportBadgePayload = {
  label_ko: '',
  label_en: '',
  label_vi: '',
  sort_order: 0,
};

export function TransportBadgesEditor({ transportId }: TransportBadgesEditorProps) {
  const [badges, setBadges] = useState<TransportBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<TransportBadgePayload>(EMPTY_ROW);
  const [editSaving, setEditSaving] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [addDraft, setAddDraft] = useState<TransportBadgePayload>(EMPTY_ROW);
  const [addSaving, setAddSaving] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transportId]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await transportBadgesService.list(transportId);
      setBadges(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // ── Add ──────────────────────────────────────────────────────────────────

  function startAdd() {
    setAddDraft(EMPTY_ROW);
    setShowAdd(true);
    setEditingId(null);
  }

  async function submitAdd() {
    if (!addDraft.label_en.trim()) return;
    setAddSaving(true);
    try {
      await transportBadgesService.create(transportId, addDraft);
      setShowAdd(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAddSaving(false);
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────

  function startEdit(badge: TransportBadge) {
    setShowAdd(false);
    setEditingId(badge.id);
    setEditDraft({
      label_ko: badge.label_ko,
      label_en: badge.label_en,
      label_vi: badge.label_vi,
      sort_order: badge.sort_order,
    });
  }

  async function submitEdit(badgeId: number) {
    setEditSaving(true);
    try {
      await transportBadgesService.update(transportId, badgeId, editDraft);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  async function handleDelete(badge: TransportBadge) {
    if (!window.confirm(`Delete badge "${badge.label_en}"?`)) return;
    try {
      await transportBadgesService.delete(transportId, badge.id);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Badges</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Feature labels shown on service cards (e.g. AC, Driver included).
          </p>
        </div>
        {!showAdd && (
          <Button variant="secondary" size="sm" onClick={startAdd}>
            <Plus size={13} /> Add badge
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
          {badges.length === 0 && !showAdd && (
            <p className="px-5 py-6 text-sm text-slate-400">No badges yet.</p>
          )}

          {badges.map((badge) =>
            editingId === badge.id ? (
              <div key={badge.id} className="px-5 py-3 bg-slate-50 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Label (KO)"
                    value={editDraft.label_ko}
                    onChange={(e) => setEditDraft((d) => ({ ...d, label_ko: e.target.value }))}
                    placeholder="에어컨"
                  />
                  <Input
                    label="Label (EN)"
                    value={editDraft.label_en}
                    onChange={(e) => setEditDraft((d) => ({ ...d, label_en: e.target.value }))}
                    placeholder="Air conditioning"
                  />
                  <Input
                    label="Label (VI)"
                    value={editDraft.label_vi}
                    onChange={(e) => setEditDraft((d) => ({ ...d, label_vi: e.target.value }))}
                    placeholder="Điều hòa"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    label="Sort"
                    type="number"
                    className="w-24"
                    value={String(editDraft.sort_order)}
                    onChange={(e) =>
                      setEditDraft((d) => ({ ...d, sort_order: parseInt(e.target.value) || 0 }))
                    }
                  />
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" loading={editSaving} onClick={() => submitEdit(badge.id)}>
                      <Check size={13} /> Save
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                      <X size={13} /> Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div key={badge.id} className="flex items-center gap-4 px-5 py-2.5">
                <span className="flex-1 text-sm font-medium text-slate-800">{badge.label_en}</span>
                <span className="text-xs text-slate-500 w-28 truncate">{badge.label_ko}</span>
                <span className="text-xs text-slate-400 w-8 text-right">{badge.sort_order}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(badge)}>
                    <Pencil size={12} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(badge)}>
                    <Trash2 size={12} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ),
          )}

          {/* Add form */}
          {showAdd && (
            <div className="px-5 py-3 bg-blue-50 border-t border-blue-100 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Label (KO)"
                  value={addDraft.label_ko}
                  onChange={(e) => setAddDraft((d) => ({ ...d, label_ko: e.target.value }))}
                  placeholder="에어컨"
                />
                <Input
                  label="Label (EN)"
                  value={addDraft.label_en}
                  onChange={(e) => setAddDraft((d) => ({ ...d, label_en: e.target.value }))}
                  placeholder="Air conditioning"
                />
                <Input
                  label="Label (VI)"
                  value={addDraft.label_vi}
                  onChange={(e) => setAddDraft((d) => ({ ...d, label_vi: e.target.value }))}
                  placeholder="Điều hòa"
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  label="Sort"
                  type="number"
                  className="w-24"
                  value={String(addDraft.sort_order)}
                  onChange={(e) =>
                    setAddDraft((d) => ({ ...d, sort_order: parseInt(e.target.value) || 0 }))
                  }
                />
                <div className="flex gap-2 mt-4">
                  <Button size="sm" loading={addSaving} onClick={submitAdd}>
                    <Check size={13} /> Add
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setShowAdd(false)}>
                    <X size={13} /> Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

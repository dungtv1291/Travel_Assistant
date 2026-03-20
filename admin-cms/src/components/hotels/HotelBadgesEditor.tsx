// ─── Hotel Badges editor ───────────────────────────────────────────────────
// Inline CRUD panel for hotel_badges.
// Same UX pattern as destinations/BadgesEditor but for hotels.

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { hotelBadgesService, type HotelBadgePayload } from '@/services/hotels.service';
import { getErrorMessage } from '@/lib/api';
import type { HotelBadge } from '@/types';

interface HotelBadgesEditorProps {
  hotelId: number;
}

const EMPTY_ROW: HotelBadgePayload = {
  label_ko: '',
  label_en: '',
  label_vi: '',
  badge_type: null,
  sort_order: 0,
};

export function HotelBadgesEditor({ hotelId }: HotelBadgesEditorProps) {
  const [badges, setBadges] = useState<HotelBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<HotelBadgePayload>(EMPTY_ROW);
  const [editSaving, setEditSaving] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [addDraft, setAddDraft] = useState<HotelBadgePayload>(EMPTY_ROW);
  const [addSaving, setAddSaving] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await hotelBadgesService.list(hotelId);
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
      await hotelBadgesService.create(hotelId, addDraft);
      setShowAdd(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAddSaving(false);
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────

  function startEdit(badge: HotelBadge) {
    setShowAdd(false);
    setEditingId(badge.id);
    setEditDraft({
      label_ko: badge.label_ko,
      label_en: badge.label_en,
      label_vi: badge.label_vi,
      badge_type: badge.badge_type,
      sort_order: badge.sort_order,
    });
  }

  async function submitEdit(badgeId: number) {
    setEditSaving(true);
    try {
      await hotelBadgesService.update(hotelId, badgeId, editDraft);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  async function handleDelete(badge: HotelBadge) {
    if (!window.confirm(`Delete badge "${badge.label_en}"?`)) return;
    try {
      await hotelBadgesService.delete(hotelId, badge.id);
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
            Labels shown on hotel cards (e.g. Free WiFi, Rooftop Pool).
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
              /* ── inline edit row ── */
              <div key={badge.id} className="px-5 py-3 bg-slate-50 space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <Input
                    label="Label (KO)"
                    value={editDraft.label_ko}
                    onChange={(e) => setEditDraft((d) => ({ ...d, label_ko: e.target.value }))}
                    placeholder="무료 와이파이"
                  />
                  <Input
                    label="Label (EN)"
                    value={editDraft.label_en}
                    onChange={(e) => setEditDraft((d) => ({ ...d, label_en: e.target.value }))}
                    placeholder="Free WiFi"
                  />
                  <Input
                    label="Label (VI)"
                    value={editDraft.label_vi}
                    onChange={(e) => setEditDraft((d) => ({ ...d, label_vi: e.target.value }))}
                    placeholder="WiFi miễn phí"
                  />
                  <Input
                    label="Type"
                    value={editDraft.badge_type ?? ''}
                    onChange={(e) => setEditDraft((d) => ({ ...d, badge_type: e.target.value || null }))}
                    placeholder="amenity"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    label="Sort"
                    type="number"
                    className="w-24"
                    value={String(editDraft.sort_order)}
                    onChange={(e) => setEditDraft((d) => ({ ...d, sort_order: parseInt(e.target.value) || 0 }))}
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
              /* ── display row ── */
              <div key={badge.id} className="flex items-center gap-4 px-5 py-2.5">
                <span className="flex-1 text-sm font-medium text-slate-800">{badge.label_en}</span>
                <span className="text-xs text-slate-500 w-24 truncate">{badge.label_ko}</span>
                <span className="text-xs text-slate-400 w-20 truncate">{badge.badge_type ?? '—'}</span>
                <span className="text-xs text-slate-400 w-10 text-right">{badge.sort_order}</span>
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
              <div className="grid grid-cols-4 gap-3">
                <Input
                  label="Label (KO)"
                  value={addDraft.label_ko}
                  onChange={(e) => setAddDraft((d) => ({ ...d, label_ko: e.target.value }))}
                  placeholder="무료 와이파이"
                />
                <Input
                  label="Label (EN)"
                  value={addDraft.label_en}
                  onChange={(e) => setAddDraft((d) => ({ ...d, label_en: e.target.value }))}
                  placeholder="Free WiFi"
                />
                <Input
                  label="Label (VI)"
                  value={addDraft.label_vi}
                  onChange={(e) => setAddDraft((d) => ({ ...d, label_vi: e.target.value }))}
                  placeholder="WiFi miễn phí"
                />
                <Input
                  label="Type"
                  value={addDraft.badge_type ?? ''}
                  onChange={(e) => setAddDraft((d) => ({ ...d, badge_type: e.target.value || null }))}
                  placeholder="amenity"
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  label="Sort"
                  type="number"
                  className="w-24"
                  value={String(addDraft.sort_order)}
                  onChange={(e) => setAddDraft((d) => ({ ...d, sort_order: parseInt(e.target.value) || 0 }))}
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

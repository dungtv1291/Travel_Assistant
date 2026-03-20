// ─── Place tags editor ────────────────────────────────────────────────────
// Inline CRUD panel for place_tags.
// Shows existing tags in a table; allows add, inline-edit, delete.

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { placeTagsService, type PlaceTagPayload } from '@/services/places.service';
import { getErrorMessage } from '@/lib/api';
import type { PlaceTag } from '@/types';

interface PlaceTagsEditorProps {
  placeId: number;
}

const EMPTY_ROW: PlaceTagPayload = {
  label_ko: '',
  label_en: '',
  label_vi: '',
  sort_order: 0,
};

export function PlaceTagsEditor({ placeId }: PlaceTagsEditorProps) {
  const [tags, setTags] = useState<PlaceTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Row being edited – null means none
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<PlaceTagPayload>(EMPTY_ROW);
  const [editSaving, setEditSaving] = useState(false);

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [addDraft, setAddDraft] = useState<PlaceTagPayload>(EMPTY_ROW);
  const [addSaving, setAddSaving] = useState(false);

  useEffect(() => {
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeId]);

  async function fetchTags() {
    setLoading(true);
    setError('');
    try {
      const data = await placeTagsService.list(placeId);
      setTags(data);
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
      await placeTagsService.create(placeId, addDraft);
      setShowAdd(false);
      await fetchTags();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAddSaving(false);
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────

  function startEdit(tag: PlaceTag) {
    setShowAdd(false);
    setEditingId(tag.id);
    setEditDraft({
      label_ko: tag.label_ko,
      label_en: tag.label_en,
      label_vi: tag.label_vi,
      sort_order: tag.sort_order,
    });
  }

  async function submitEdit(tagId: number) {
    setEditSaving(true);
    try {
      await placeTagsService.update(placeId, tagId, editDraft);
      setEditingId(null);
      await fetchTags();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  async function handleDelete(tag: PlaceTag) {
    if (!window.confirm(`Delete tag "${tag.label_en}"?`)) return;
    try {
      await placeTagsService.delete(placeId, tag.id);
      await fetchTags();
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
          <h3 className="text-sm font-semibold text-slate-800">Tags</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Labels shown on place cards (e.g. UNESCO, 해변, Tham quan).
          </p>
        </div>
        {!showAdd && (
          <Button variant="secondary" size="sm" onClick={startAdd}>
            <Plus size={13} /> Add tag
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
          {/* Existing rows */}
          {tags.length === 0 && !showAdd && (
            <p className="px-5 py-6 text-sm text-slate-400">No tags yet.</p>
          )}

          {tags.map((tag) =>
            editingId === tag.id ? (
              /* ── inline edit row ── */
              <div key={tag.id} className="px-5 py-3 bg-slate-50 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    label="Label (KO)"
                    value={editDraft.label_ko}
                    onChange={(e) => setEditDraft((d) => ({ ...d, label_ko: e.target.value }))}
                    placeholder="유적지"
                  />
                  <Input
                    label="Label (EN)"
                    value={editDraft.label_en}
                    onChange={(e) => setEditDraft((d) => ({ ...d, label_en: e.target.value }))}
                    placeholder="Historical"
                  />
                  <Input
                    label="Label (VI)"
                    value={editDraft.label_vi}
                    onChange={(e) => setEditDraft((d) => ({ ...d, label_vi: e.target.value }))}
                    placeholder="Lịch sử"
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
                    <Button size="sm" loading={editSaving} onClick={() => submitEdit(tag.id)}>
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
              <div key={tag.id} className="flex items-center gap-4 px-5 py-2.5">
                <span className="flex-1 text-sm font-medium text-slate-800">{tag.label_en}</span>
                <span className="text-xs text-slate-500 w-28 truncate">{tag.label_ko}</span>
                <span className="text-xs text-slate-400 w-28 truncate">{tag.label_vi}</span>
                <span className="text-xs text-slate-400 w-10 text-right">{tag.sort_order}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(tag)}>
                    <Pencil size={12} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(tag)}>
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
                  placeholder="유적지"
                />
                <Input
                  label="Label (EN)"
                  value={addDraft.label_en}
                  onChange={(e) => setAddDraft((d) => ({ ...d, label_en: e.target.value }))}
                  placeholder="Historical"
                />
                <Input
                  label="Label (VI)"
                  value={addDraft.label_vi}
                  onChange={(e) => setAddDraft((d) => ({ ...d, label_vi: e.target.value }))}
                  placeholder="Lịch sử"
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

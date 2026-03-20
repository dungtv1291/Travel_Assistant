// ─── Hotel Images editor ───────────────────────────────────────────────────
// Inline CRUD panel for hotel_images (URL-based, no file upload).
// Lists images with preview thumbnail, sort_order, inline edit/delete.

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, ImageOff } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { hotelImagesService, type HotelImagePayload } from '@/services/hotels.service';
import { getErrorMessage } from '@/lib/api';
import type { HotelImage } from '@/types';

interface HotelImagesEditorProps {
  hotelId: number;
}

const EMPTY_ROW: HotelImagePayload = {
  image_url: '',
  sort_order: 0,
};

export function HotelImagesEditor({ hotelId }: HotelImagesEditorProps) {
  const [images, setImages] = useState<HotelImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<HotelImagePayload>(EMPTY_ROW);
  const [editSaving, setEditSaving] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [addDraft, setAddDraft] = useState<HotelImagePayload>(EMPTY_ROW);
  const [addSaving, setAddSaving] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await hotelImagesService.list(hotelId);
      setImages(data);
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
    if (!addDraft.image_url.trim()) return;
    setAddSaving(true);
    try {
      await hotelImagesService.create(hotelId, addDraft);
      setShowAdd(false);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setAddSaving(false);
    }
  }

  // ── Edit ─────────────────────────────────────────────────────────────────

  function startEdit(image: HotelImage) {
    setShowAdd(false);
    setEditingId(image.id);
    setEditDraft({ image_url: image.image_url, sort_order: image.sort_order });
  }

  async function submitEdit(imageId: number) {
    setEditSaving(true);
    try {
      await hotelImagesService.update(hotelId, imageId, editDraft);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setEditSaving(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  async function handleDelete(image: HotelImage) {
    if (!window.confirm('Delete this image?')) return;
    try {
      await hotelImagesService.delete(hotelId, image.id);
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
          <h3 className="text-sm font-semibold text-slate-800">Images</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Gallery images shown on the hotel detail page.
          </p>
        </div>
        {!showAdd && (
          <Button variant="secondary" size="sm" onClick={startAdd}>
            <Plus size={13} /> Add image
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
          {images.length === 0 && !showAdd && (
            <p className="px-5 py-6 text-sm text-slate-400">No images yet.</p>
          )}

          {images.map((image) =>
            editingId === image.id ? (
              /* ── inline edit row ── */
              <div key={image.id} className="px-5 py-3 bg-slate-50 space-y-3">
                <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                  <Input
                    label="Image URL"
                    value={editDraft.image_url}
                    onChange={(e) => setEditDraft((d) => ({ ...d, image_url: e.target.value }))}
                    placeholder="/uploads/hotels/grand-palace-1.jpg"
                  />
                  <Input
                    label="Sort"
                    type="number"
                    className="w-24"
                    value={String(editDraft.sort_order)}
                    onChange={(e) => setEditDraft((d) => ({ ...d, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" loading={editSaving} onClick={() => submitEdit(image.id)}>
                    <Check size={13} /> Save
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>
                    <X size={13} /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* ── display row ── */
              <div key={image.id} className="flex items-center gap-4 px-5 py-2.5">
                {/* Thumbnail */}
                <div className="w-14 h-10 rounded overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                  {image.image_url ? (
                    <img
                      src={image.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <ImageOff size={16} className="text-slate-400" />
                  )}
                </div>
                <span className="flex-1 text-xs text-slate-600 truncate">{image.image_url}</span>
                <span className="text-xs text-slate-400 w-10 text-right">{image.sort_order}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(image)}>
                    <Pencil size={12} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(image)}>
                    <Trash2 size={12} className="text-red-500" />
                  </Button>
                </div>
              </div>
            ),
          )}

          {/* Add form */}
          {showAdd && (
            <div className="px-5 py-3 bg-blue-50 border-t border-blue-100 space-y-3">
              <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                <Input
                  label="Image URL"
                  value={addDraft.image_url}
                  onChange={(e) => setAddDraft((d) => ({ ...d, image_url: e.target.value }))}
                  placeholder="/uploads/hotels/grand-palace-1.jpg"
                  hint="Enter a path or full URL."
                />
                <Input
                  label="Sort"
                  type="number"
                  className="w-24"
                  value={String(addDraft.sort_order)}
                  onChange={(e) => setAddDraft((d) => ({ ...d, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" loading={addSaving} onClick={submitAdd}>
                  <Check size={13} /> Add
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowAdd(false)}>
                  <X size={13} /> Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

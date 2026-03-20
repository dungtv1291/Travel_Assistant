import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import {
  HotelRoomForm,
  roomToFormValues,
  type HotelRoomFormValues,
} from '@/components/hotel-rooms/HotelRoomForm';
import { RoomBadgesEditor } from '@/components/hotel-rooms/RoomBadgesEditor';
import { roomTypesService } from '@/services/hotel-rooms.service';
import { getErrorMessage } from '@/lib/api';
import type { HotelRoomType } from '@/types';

function coercePayload(values: HotelRoomFormValues) {
  return {
    ...values,
    hotel_id: parseInt(values.hotel_id),
    room_size_m2: values.room_size_m2 !== '' ? parseInt(values.room_size_m2) : null,
    max_guests: values.max_guests !== '' ? parseInt(values.max_guests) : null,
    nightly_price: parseInt(values.nightly_price),
    currency: values.currency || 'KRW',
    cover_image_url: values.cover_image_url || null,
    bed_label_ko: values.bed_label_ko || null,
    bed_label_en: values.bed_label_en || null,
    bed_label_vi: values.bed_label_vi || null,
    sort_order: parseInt(values.sort_order) || 0,
  };
}

export function HotelRoomEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = useState<HotelRoomType | null>(null);
  const [loadError, setLoadError] = useState('');
  const [serverError, setServerError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const roomId = parseInt(id ?? '', 10);

  useEffect(() => {
    if (!roomId) return;
    roomTypesService
      .get(roomId)
      .then(setRoom)
      .catch((err) => setLoadError(getErrorMessage(err)));
  }, [roomId]);

  async function handleSubmit(values: HotelRoomFormValues) {
    setServerError('');
    setSaveSuccess(false);
    try {
      const updated = await roomTypesService.update(roomId, coercePayload(values));
      setRoom(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  }

  if (loadError) {
    return (
      <div>
        <PageHeader
          title="Edit Room Type"
          actions={
            <Link to="/hotel-rooms">
              <Button variant="secondary" size="sm">← Back</Button>
            </Link>
          }
        />
        <div className="mt-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div>
        <PageHeader title="Loading…" />
        <div className="mt-6 text-sm text-slate-400">Fetching room type…</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit: ${room.name_en || room.name_ko}`}
        subtitle={`Room Type ID ${room.id} · Hotel #${room.hotel_id}`}
        actions={
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-green-600 font-medium">Saved ✓</span>
            )}
            <Link to="/hotel-rooms">
              <Button variant="secondary" size="sm">← Back to list</Button>
            </Link>
          </div>
        }
      />

      <div className="mt-6 space-y-6">
        <HotelRoomForm
          defaultValues={roomToFormValues(room)}
          onSubmit={handleSubmit}
          submitLabel="Save changes"
          serverError={serverError}
        />

        <RoomBadgesEditor roomId={roomId} />

        <div className="rounded-xl border border-red-200 bg-white">
          <div className="border-b border-red-100 px-5 py-3.5">
            <h3 className="text-sm font-semibold text-red-700">Danger Zone</h3>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Delete this room type</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Permanently deletes the room type and all its badges.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={async () => {
                if (!window.confirm(`Permanently delete "${room.name_en || room.name_ko}"? This cannot be undone.`)) return;
                try {
                  await roomTypesService.delete(roomId);
                  navigate('/hotel-rooms', { replace: true });
                } catch (err) {
                  alert(getErrorMessage(err));
                }
              }}
            >
              Delete room type
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

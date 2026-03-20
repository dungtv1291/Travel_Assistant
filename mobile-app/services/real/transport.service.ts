import { TransportVehicle, TransportBooking, TransportType } from '../../types/transport.types';
import { httpClient } from '../http/http.client';
import { mapTransportItem } from '../adapters/transport.adapter';
import { mockTransports } from '../../mock/transport';

// ── Real implementation mirroring mock/transport.service.ts ──────────────────
//
// NOTE: The /transports endpoints are not yet implemented in the backend.
//       All read methods fall back to mock data and will be swapped once the
//       transports module ships.

interface ListResponse<T> {
  items?: T[];
}

export const realTransportService = {
  getAll: async (): Promise<TransportVehicle[]> => {
    try {
      const data = await httpClient.get<ListResponse<Record<string, unknown>>>(
        '/transports?limit=50',
      );
      const items = data.items ?? [];
      if (items.length > 0) return items.map((item) => mapTransportItem(item as any));
    } catch {
      // Backend not yet available
    }
    return mockTransports;
  },

  getByType: async (type: TransportType): Promise<TransportVehicle[]> => {
    try {
      const encoded = encodeURIComponent(type);
      const data = await httpClient.get<ListResponse<Record<string, unknown>>>(
        `/transports?type=${encoded}&limit=50`,
      );
      const items = data.items ?? [];
      if (items.length > 0) return items.map((item) => mapTransportItem(item as any));
    } catch {
      // Backend not yet available
    }
    return mockTransports.filter((t) => t.type === type);
  },

  getById: async (id: string): Promise<TransportVehicle | null> => {
    try {
      const data = await httpClient.get<Record<string, unknown>>(`/transports/${id}`);
      return mapTransportItem(data as any);
    } catch {
      // Fall through to mock
    }
    return mockTransports.find((t) => t.id === id) ?? null;
  },

  createBooking: async (
    bookingData: Omit<TransportBooking, 'id' | 'bookedAt' | 'confirmationCode'>,
  ): Promise<TransportBooking> => {
    try {
      const payload = {
        transportId: parseInt(bookingData.vehicleId, 10) || bookingData.vehicleId,
        pickupOptionKey: bookingData.pickupLocation,
        usageDate: bookingData.pickupDate,
        durationOptionValue: bookingData.days ?? 1,
        guestFullName: '',
        guestEmail: '',
        note: '',
        currency: bookingData.currency,
      };
      const res = await httpClient.post<Record<string, unknown>>('/transport-bookings', payload);
      return {
        ...bookingData,
        id: String((res as any).bookingId ?? `tbooking-${Date.now()}`),
        bookedAt: new Date().toISOString(),
        confirmationCode: (res as any).bookingCode ?? `VTT${Math.random().toString(36).toUpperCase().slice(2, 8)}`,
        driverName: (res as any).driverLabel,
      };
    } catch {
      // Backend not yet available — synthesize a local booking
      return {
        ...bookingData,
        id: `tbooking-${Date.now()}`,
        bookedAt: new Date().toISOString(),
        confirmationCode: `VTT${Math.random().toString(36).toUpperCase().slice(2, 8)}`,
        driverName:
          bookingData.type !== 'self_drive' && bookingData.type !== 'scooter'
            ? 'Nguyen Van An'
            : undefined,
        driverPhone:
          bookingData.type !== 'self_drive' && bookingData.type !== 'scooter'
            ? '+84-012-345-678'
            : undefined,
      };
    }
  },
};

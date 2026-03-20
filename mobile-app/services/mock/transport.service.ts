import { delay } from '../api.client';
import { mockTransports } from '../../mock/transport';
import { TransportVehicle, TransportBooking, TransportType } from '../../types/transport.types';
import { USE_REAL_API } from '../config/api.config';
import { realTransportService } from '../real/transport.service';

const _mock = {
  getAll: async (): Promise<TransportVehicle[]> => {
    await delay(600);
    return mockTransports;
  },

  getByType: async (type: TransportType): Promise<TransportVehicle[]> => {
    await delay(500);
    return mockTransports.filter(t => t.type === type);
  },

  getById: async (id: string): Promise<TransportVehicle | null> => {
    await delay(300);
    return mockTransports.find(t => t.id === id) ?? null;
  },

  createBooking: async (
    bookingData: Omit<TransportBooking, 'id' | 'bookedAt' | 'confirmationCode'>
  ): Promise<TransportBooking> => {
    await delay(1500);
    return {
      ...bookingData,
      id: `tbooking-${Date.now()}`,
      bookedAt: new Date().toISOString(),
      confirmationCode: `VTT${Math.random().toString(36).toUpperCase().slice(2, 8)}`,
      driverName: bookingData.type !== 'self_drive' && bookingData.type !== 'scooter' ? 'Nguyen Van An' : undefined,
      driverPhone: bookingData.type !== 'self_drive' && bookingData.type !== 'scooter' ? '+84-012-345-678' : undefined,
    };
  },
};

export const transportService = USE_REAL_API ? realTransportService : _mock;

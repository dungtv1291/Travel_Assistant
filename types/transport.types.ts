export interface TransportVehicle {
  id: string;
  type: TransportType;
  name: string;
  nameKo: string;
  imageUrl: string;
  description: string;
  descriptionKo?: string;
  vehicleModel?: string;
  capacity: number;
  luggageCapacity?: number;
  pricePerDay?: number;
  pricePerTrip?: number;
  priceUnit?: string;
  currency: string;
  features: string[];
  rating: number;
  reviewCount: number;
  driverIncluded: boolean;
  available: boolean;
  isPopular?: boolean;
  tags: string[];
}

export type TransportType = 
  | 'airport_pickup'
  | 'private_car'
  | 'self_drive'
  | 'day_tour'
  | 'scooter';

export interface TransportBooking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleImage: string;
  type: TransportType;
  pickupLocation: string;
  dropoffLocation?: string;
  pickupDate: string;
  returnDate?: string;
  days?: number;
  passengerCount: number;
  totalPrice: number;
  currency: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  bookedAt: string;
  confirmationCode: string;
  driverName?: string;
  driverPhone?: string;
}

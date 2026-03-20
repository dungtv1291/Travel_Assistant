import { Injectable, Logger } from '@nestjs/common';
import {
  FlightSearchRequest,
  IFlightProvider,
  NormalizedDeal,
  NormalizedFlight,
} from './interfaces/flight-provider.interface';

/**
 * Mock flight provider — used in development / testing when Travelpayouts
 * credentials are not available.
 *
 * Returns deterministic fake data that covers all tag categories and is
 * varied enough for UI testing.
 */
@Injectable()
export class MockFlightProviderService implements IFlightProvider {
  private readonly logger = new Logger(MockFlightProviderService.name);

  async searchFlights(req: FlightSearchRequest): Promise<NormalizedFlight[]> {
    this.logger.debug(
      `[mock] searchFlights ${req.originCode}→${req.destinationCode} on ${req.departureDate}`,
    );

    const results: NormalizedFlight[] = [
      {
        id: `flt_KE001_${req.departureDate}_0`,
        airlineName: '대한항공',
        airlineCode: 'KE',
        originCode: req.originCode,
        destinationCode: req.destinationCode,
        departureTime: '09:30',
        arrivalTime: '13:00',
        durationMinutes: 270,
        stops: 0,
        priceAmount: 285000,
        currency: req.currency,
        tags: ['fastest'],
        bookingUrl: null,
      },
      {
        id: `flt_OZ202_${req.departureDate}_1`,
        airlineName: '아시아나항공',
        airlineCode: 'OZ',
        originCode: req.originCode,
        destinationCode: req.destinationCode,
        departureTime: '07:00',
        arrivalTime: '10:30',
        durationMinutes: 270,
        stops: 0,
        priceAmount: 270000,
        currency: req.currency,
        tags: ['cheapest'],
        bookingUrl: null,
      },
      {
        id: `flt_7C803_${req.departureDate}_2`,
        airlineName: '제주항공',
        airlineCode: '7C',
        originCode: req.originCode,
        destinationCode: req.destinationCode,
        departureTime: '14:00',
        arrivalTime: '17:40',
        durationMinutes: 280,
        stops: 0,
        priceAmount: 249000,
        currency: req.currency,
        tags: ['cheapest', 'best_value'],
        bookingUrl: null,
      },
      {
        id: `flt_TW305_${req.departureDate}_3`,
        airlineName: '티웨이항공',
        airlineCode: 'TW',
        originCode: req.originCode,
        destinationCode: req.destinationCode,
        departureTime: '18:00',
        arrivalTime: '22:00',
        durationMinutes: 300,
        stops: 1,
        priceAmount: 230000,
        currency: req.currency,
        tags: [],
        bookingUrl: null,
      },
    ];

    return results;
  }

  async getDeals(): Promise<NormalizedDeal[]> {
    return [
      {
        id: 'deal_KE_ICN_DAD_001',
        airlineName: '대한항공',
        airlineCode: 'KE',
        originCode: 'ICN',
        destinationCode: 'DAD',
        originLabel: '서울',
        destinationLabel: '다낭',
        departureTime: '09:30',
        arrivalTime: '13:00',
        durationMinutes: 270,
        priceAmount: 285000,
        currency: 'KRW',
        dealTag: '최단시간',
      },
      {
        id: 'deal_OZ_ICN_DAD_002',
        airlineName: '아시아나항공',
        airlineCode: 'OZ',
        originCode: 'ICN',
        destinationCode: 'DAD',
        originLabel: '서울',
        destinationLabel: '다낭',
        departureTime: '07:00',
        arrivalTime: '10:30',
        durationMinutes: 270,
        priceAmount: 270000,
        currency: 'KRW',
        dealTag: '최저가',
      },
      {
        id: 'deal_7C_ICN_DAD_003',
        airlineName: '제주항공',
        airlineCode: '7C',
        originCode: 'ICN',
        destinationCode: 'DAD',
        originLabel: '서울',
        destinationLabel: '다낭',
        departureTime: '14:00',
        arrivalTime: '17:40',
        durationMinutes: 280,
        priceAmount: 249000,
        currency: 'KRW',
        dealTag: '인기',
      },
    ];
  }
}

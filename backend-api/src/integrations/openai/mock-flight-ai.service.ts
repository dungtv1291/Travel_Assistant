import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NormalizedFlight } from '../travelpayouts/interfaces/flight-provider.interface';
import {
  FlightRecommendRequest,
  FlightRecommendResult,
  IFlightAiService,
  RecommendedFlightOption,
} from './interfaces/flight-ai.interface';

// ---------------------------------------------------------------------------
// Locale helpers
// ---------------------------------------------------------------------------

const REASONS: Record<
  string,
  {
    best: (f: NormalizedFlight) => string;
    cheapest: (f: NormalizedFlight) => string;
    fastest: (f: NormalizedFlight) => string;
    summary: string;
  }
> = {
  ko: {
    best: (f) =>
      `출발 시간과 가격의 균형이 가장 좋습니다. (${f.stops === 0 ? '직항' : `${f.stops}회 경유`})`,
    cheapest: () => '가장 저렴한 옵션입니다.',
    fastest: (f) =>
      `${f.stops === 0 ? '직항이며' : ''} 소요 시간이 가장 짧습니다. (${f.durationMinutes}분)`,
    summary: '최저가, 최단시간, 최고 가성비 순으로 추천했습니다.',
  },
  en: {
    best: (f) =>
      `Best balance of price and schedule. (${f.stops === 0 ? 'Direct' : `${f.stops} stop(s)`})`,
    cheapest: () => 'The most affordable option.',
    fastest: (f) =>
      `${f.stops === 0 ? 'Direct flight, ' : ''}shortest travel time (${f.durationMinutes} min).`,
    summary: 'Ranked by cheapest, fastest, and best value.',
  },
  vi: {
    best: (f) =>
      `Cân bằng tốt nhất giữa giá và lịch trình. (${f.stops === 0 ? 'Bay thẳng' : `${f.stops} điểm dừng`})`,
    cheapest: () => 'Lựa chọn rẻ nhất.',
    fastest: (f) =>
      `${f.stops === 0 ? 'Bay thẳng, ' : ''}thời gian ngắn nhất (${f.durationMinutes} phút).`,
    summary: 'Xếp hạng theo giá rẻ nhất, nhanh nhất và tốt nhất.',
  },
};

function getLocale(language: string) {
  return REASONS[language] ?? REASONS['ko'];
}

function toOption(f: NormalizedFlight, reason: string): RecommendedFlightOption {
  return {
    id: f.id,
    airlineName: f.airlineName,
    priceAmount: f.priceAmount,
    currency: f.currency,
    reason,
  };
}

// ---------------------------------------------------------------------------
// Mock AI service — uses pure heuristics, no OpenAI call.
// Replace with OpenAiFlightService when real AI is needed.
// ---------------------------------------------------------------------------

@Injectable()
export class MockFlightAiService implements IFlightAiService {
  private readonly logger = new Logger(MockFlightAiService.name);

  constructor(private readonly config: ConfigService) {}

  async recommend(req: FlightRecommendRequest): Promise<FlightRecommendResult> {
    this.logger.debug(`[mock] recommend preference=${req.preference}`);

    const { flights, language } = req;
    const locale = getLocale(language);

    if (flights.length === 0) {
      const fallback: RecommendedFlightOption = {
        id: 'none',
        airlineName: '-',
        priceAmount: 0,
        currency: 'KRW',
        reason: locale.summary,
      };
      return {
        bestOption: fallback,
        cheapestOption: fallback,
        fastestOption: fallback,
        reasoningSummary: locale.summary,
      };
    }

    const cheapest = [...flights].sort((a, b) => a.priceAmount - b.priceAmount)[0];
    const fastest = [...flights].sort(
      (a, b) => a.durationMinutes - b.durationMinutes,
    )[0];

    // "Best value" = lowest score on combined (normalised price + normalised duration)
    const maxPrice = Math.max(...flights.map((f) => f.priceAmount));
    const minPrice = Math.min(...flights.map((f) => f.priceAmount));
    const maxDur = Math.max(...flights.map((f) => f.durationMinutes));
    const minDur = Math.min(...flights.map((f) => f.durationMinutes));

    const priceRange = maxPrice - minPrice || 1;
    const durRange = maxDur - minDur || 1;

    const best = [...flights].sort((a, b) => {
      const scoreA =
        (a.priceAmount - minPrice) / priceRange +
        (a.durationMinutes - minDur) / durRange;
      const scoreB =
        (b.priceAmount - minPrice) / priceRange +
        (b.durationMinutes - minDur) / durRange;
      return scoreA - scoreB;
    })[0];

    return {
      bestOption: toOption(best, locale.best(best)),
      cheapestOption: toOption(cheapest, locale.cheapest(cheapest)),
      fastestOption: toOption(fastest, locale.fastest(fastest)),
      reasoningSummary: locale.summary,
    };
  }
}

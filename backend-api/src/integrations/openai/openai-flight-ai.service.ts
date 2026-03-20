import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type OpenAI from 'openai';
import { NormalizedFlight } from '../travelpayouts/interfaces/flight-provider.interface';
import { OPENAI_CLIENT } from './openai-client.provider';
import type {
  FlightRecommendRequest,
  FlightRecommendResult,
  IFlightAiService,
  RecommendedFlightOption,
} from './interfaces/flight-ai.interface';

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

function buildFlightSystemPrompt(language: string): string {
  const langInstruction =
    language === 'ko'
      ? 'Respond entirely in Korean.'
      : language === 'vi'
        ? 'Respond entirely in Vietnamese.'
        : 'Respond entirely in English.';

  return `You are a flight recommendation AI assistant.
${langInstruction}
Given a list of flights, identify three options and explain each choice.

Return ONLY valid JSON matching this exact schema — no markdown, no extra keys:
{
  "bestOption":    FlightOption,
  "cheapestOption": FlightOption,
  "fastestOption": FlightOption,
  "reasoningSummary": string   // 1–2 sentence overall summary
}

FlightOption = {
  "id":          string,   // must match the "id" field from an input flight exactly
  "airlineName": string,   // must match the "airlineName" field from that flight exactly
  "priceAmount": number,   // must match the "priceAmount" from that flight exactly
  "currency":    string,   // must match the "currency" from that flight exactly
  "reason":      string    // 1 sentence explaining why this flight was chosen
}

Definitions:
- bestOption:     best balance of price, duration, and number of stops
- cheapestOption: the flight with the lowest priceAmount
- fastestOption:  the flight with the shortest durationMinutes

Rules:
- bestOption, cheapestOption, and fastestOption may reference the same flight if appropriate.
- id and airlineName must be copied verbatim from the input; do not invent new values.`;
}

function buildFlightUserPrompt(req: FlightRecommendRequest): string {
  const flightList = req.flights
    .map(
      (f: NormalizedFlight) =>
        `id: ${f.id}, airline: ${f.airlineName}, price: ${f.priceAmount} ${f.currency}, ` +
        `duration: ${f.durationMinutes} min, stops: ${f.stops}, ` +
        `departs: ${f.departureTime}, arrives: ${f.arrivalTime}`,
    )
    .join('\n');

  return `User preference: ${req.preference}
Language: ${req.language}

Available flights:
${flightList}

Recommend the best, cheapest, and fastest options from the list above.`;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class OpenAiFlightAiService implements IFlightAiService {
  private readonly logger = new Logger(OpenAiFlightAiService.name);

  constructor(
    @Inject(OPENAI_CLIENT) private readonly client: OpenAI,
    private readonly config: ConfigService,
  ) {}

  async recommend(req: FlightRecommendRequest): Promise<FlightRecommendResult> {
    if (req.flights.length === 0) {
      throw new Error('No flights provided for AI recommendation');
    }

    const model = this.config.get<string>('openai.model') ?? 'gpt-4o';

    this.logger.log(
      `[openai-flight-ai] recommend preference=${req.preference} flightCount=${req.flights.length}`,
    );

    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: buildFlightSystemPrompt(req.language) },
        { role: 'user', content: buildFlightUserPrompt(req) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // low temperature — deterministic ranking
    });

    const rawText = completion.choices[0]?.message?.content ?? '';

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      this.logger.error('[openai-flight-ai] Could not parse JSON from model response');
      throw new Error('OpenAI returned malformed JSON for flight recommendation');
    }

    // Validate that referenced IDs exist in the input list
    const validIds = new Set(req.flights.map((f) => f.id));
    for (const key of ['bestOption', 'cheapestOption', 'fastestOption'] as const) {
      const opt = parsed[key] as RecommendedFlightOption | undefined;
      if (!opt?.id || !validIds.has(opt.id)) {
        this.logger.warn(
          `[openai-flight-ai] ${key}.id "${opt?.id}" not found in input flights — falling back to heuristic`,
        );
        parsed[key] = this.heuristicOption(req.flights, key);
      }
    }

    return parsed as unknown as FlightRecommendResult;
  }

  // Deterministic fallback if AI returns an invalid flight ID
  private heuristicOption(
    flights: NormalizedFlight[],
    key: 'bestOption' | 'cheapestOption' | 'fastestOption',
  ): RecommendedFlightOption {
    let flight: NormalizedFlight;
    if (key === 'cheapestOption') {
      flight = flights.reduce((a, b) => (a.priceAmount <= b.priceAmount ? a : b));
    } else if (key === 'fastestOption') {
      flight = flights.reduce((a, b) =>
        a.durationMinutes <= b.durationMinutes ? a : b,
      );
    } else {
      // best_value: lowest price-per-minute ratio
      flight = flights.reduce((a, b) => {
        const scoreA = a.priceAmount / a.durationMinutes;
        const scoreB = b.priceAmount / b.durationMinutes;
        return scoreA <= scoreB ? a : b;
      });
    }
    return {
      id: flight.id,
      airlineName: flight.airlineName,
      priceAmount: flight.priceAmount,
      currency: flight.currency,
      reason: '',
    };
  }
}

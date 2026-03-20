import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type OpenAI from 'openai';
import { OPENAI_CLIENT } from './openai-client.provider';
import type {
  DayData,
  IAiPlannerService,
  PlannerInput,
  PlannerOutput,
} from './interfaces/ai-planner.interface';

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

function buildSystemPrompt(language: string): string {
  const langInstruction =
    language === 'ko'
      ? 'Respond entirely in Korean.'
      : language === 'vi'
        ? 'Respond entirely in Vietnamese.'
        : 'Respond entirely in English.';

  return `You are an expert travel itinerary planner.
${langInstruction}
Your task is to generate a detailed, realistic travel itinerary as a JSON object.

OUTPUT SCHEMA (strict — every field is required unless marked nullable):
{
  "title": string,           // e.g. "다낭 3박 4일 커플 여행"
  "budgetLabel": string,     // e.g. "적당한 예산 여행" / "Moderate Budget Trip"
  "totalCost": MoneyAmount,
  "days": DayData[]          // length must equal the requested number of days
}

MoneyAmount = { "currency": "KRW"|"VND"|"USD", "amount": integer, "display": string }
  display formats by currency:
    KRW  → "₩15K"  "₩1.2M"  "₩120K"
    VND  → "15K đ"  "1.5M đ"  "120K đ"
    USD  → "$15"  "$120"  "$1.2K"

DayData = {
  "dayNumber": integer,
  "date": "YYYY-MM-DD" | null,
  "dateLabel": "M.D" | null,       // e.g. "3.18"
  "dayLabel": string,              // e.g. "DAY 1" / "NGÀY 1"
  "title": string,                 // short day theme, e.g. "도착 & 해변 탐방"
  "weather": WeatherData,
  "estimatedCost": MoneyAmount,
  "items": TimelineItem[],         // 5–7 items
  "warnings": Warning[],           // 0–3 items
  "bookingNeededItems": string[],  // display names of items requiring advance booking
  "smartTips": Tip[]               // 2–4 practical tips
}

WeatherData = {
  "conditionCode": "sunny"|"cloudy"|"partly_cloudy"|"rain"|"storm"|"windy",
  "conditionLabel": string,        // localized, e.g. "맑음" / "Sunny"
  "temperatureC": integer,
  "note": string,                  // short advice, e.g. "자외선 차단제 필수"
  "iconKey": "sun"|"cloud_sun"|"cloud"|"rain"|"storm"|"wind" | null
}

TimelineItem = {
  "itemPublicId": string,          // pattern: "item_d{dayNumber}_{twoDigitIndex}" e.g. "item_d1_01"
  "type": "food"|"transport"|"beach"|"attraction"|"shopping"|"hotel"|"cafe"|"nightlife"|"wellness"|"photo",
  "startTime": "HH:MM",
  "durationMinutes": integer,
  "durationLabel": string,         // localized, e.g. "2시간" / "2 hours" / "2 giờ"
  "title": string,
  "description": string,           // 1–2 sentences
  "location": { "name": string, "address": string|null, "lat": number|null, "lng": number|null },
  "estimatedCost": MoneyAmount | null,
  "tipText": string | null,
  "bookingRequired": boolean,
  "bookingUrl": null,              // always null
  "accentColor": "orange"|"blue"|"cyan"|"green"|"purple"|"gray",
  "iconKey": "meal"|"car"|"beach"|"camera"|"shopping"|"bed"|"coffee"|"moon"|"leaf"|"pin",
  "imageUrl": null,                // always null
  "tags": string[]
}

accentColor mapping (follow these):
  food/cafe → "orange", transport → "gray", beach/wellness → "cyan",
  attraction/photo → "blue", shopping → "purple", hotel → "blue", nightlife → "purple"

iconKey mapping (follow these):
  food → "meal", transport → "car", beach → "beach", attraction/photo → "camera",
  shopping → "shopping", hotel → "bed", cafe → "coffee", nightlife → "moon",
  wellness → "leaf", photo → "pin"

Warning = {
  "type": "weather"|"booking_required"|"crowded"|"timing"|"transport"|"general",
  "title": string | null,
  "text": string,
  "count": integer | null
}

Tip = { "orderNo": integer, "text": string, "iconKey": string | null }

Rules:
- Return ONLY valid JSON — no markdown, no explanation outside the JSON.
- Every day must have 5–7 items with non-overlapping time slots.
- totalCost.amount must equal the sum of all day estimatedCost.amount values.
- item startTimes must be ordered chronologically within each day.
- Use realistic prices for the destination and currency.
- itemPublicId must be unique across all days.`;
}

// ---------------------------------------------------------------------------
// User prompt
// ---------------------------------------------------------------------------

function buildUserPrompt(input: PlannerInput): string {
  const styles =
    input.travelStyles.length > 0 ? input.travelStyles.join(', ') : 'general';
  const interests =
    input.interests.length > 0 ? input.interests.join(', ') : 'sightseeing';

  return `Generate a travel itinerary with these parameters:
- Destination: ${input.destination.name} (code: ${input.destination.code ?? 'N/A'})
- Duration: ${input.nights} nights / ${input.days} days
- Start date: ${input.startDate ?? 'flexible (use null for date fields)'}
- Traveler type: ${input.travelerType}
- Budget level: ${input.budgetLevel}
- Pace: ${input.pace}
- Travel styles: ${styles}
- Interests: ${interests}
- Language: ${input.language}
- Currency: ${input.currency}

Return exactly ${input.days} day(s) in the "days" array.`;
}

// ---------------------------------------------------------------------------
// Response normalizer — fills in any nullable fields the AI may have omitted
// ---------------------------------------------------------------------------

function normalizeDays(days: unknown[]): DayData[] {
  return (days as DayData[]).map((day, idx) => ({
    ...day,
    dayNumber: day.dayNumber ?? idx + 1,
    date: day.date ?? null,
    dateLabel: day.dateLabel ?? null,
    items: (day.items ?? []).map((item, iIdx) => ({
      ...item,
      itemPublicId:
        item.itemPublicId ?? `item_d${idx + 1}_${String(iIdx + 1).padStart(2, '0')}`,
      bookingUrl: null,
      imageUrl: null,
      tags: item.tags ?? [],
    })),
    warnings: day.warnings ?? [],
    bookingNeededItems: day.bookingNeededItems ?? [],
    smartTips: day.smartTips ?? [],
  }));
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class OpenAiPlannerService implements IAiPlannerService {
  private readonly logger = new Logger(OpenAiPlannerService.name);

  lastCallMeta?: {
    providerName: string;
    modelName: string | null;
    tokensUsed: number | null;
  };

  constructor(
    @Inject(OPENAI_CLIENT) private readonly client: OpenAI,
    private readonly config: ConfigService,
  ) {}

  async generate(input: PlannerInput): Promise<PlannerOutput> {
    const model = this.config.get<string>('openai.model') ?? 'gpt-4o';

    this.logger.log(
      `[openai-planner] generate destination=${input.destination.slug} days=${input.days} lang=${input.language}`,
    );

    const completion = await this.client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: buildSystemPrompt(input.language) },
        { role: 'user', content: buildUserPrompt(input) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    this.lastCallMeta = {
      providerName: 'openai',
      modelName: completion.model,
      tokensUsed: completion.usage?.total_tokens ?? null,
    };

    const rawText = completion.choices[0]?.message?.content ?? '';

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      this.logger.error('[openai-planner] Could not parse JSON from model response');
      throw new Error('OpenAI returned malformed JSON for itinerary generation');
    }

    if (!Array.isArray(parsed['days'])) {
      this.logger.error('[openai-planner] Response missing "days" array');
      throw new Error('OpenAI itinerary response is missing the "days" field');
    }

    return {
      title: String(parsed['title'] ?? ''),
      budgetLabel: String(parsed['budgetLabel'] ?? ''),
      totalCost: parsed['totalCost'] as PlannerOutput['totalCost'],
      days: normalizeDays(parsed['days'] as unknown[]),
    };
  }
}

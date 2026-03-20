import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import {
  AI_PLANNER_SERVICE,
  IAiPlannerService,
  PlannerInput,
} from '../../integrations/openai/interfaces/ai-planner.interface';
import { DestinationsRepository } from '../destinations/repositories/destinations.repository';
import { GenerateItineraryDto } from './dto/generate-itinerary.dto';
import { ItineraryQueryDto } from './dto/itinerary-query.dto';
import { RegenerateItineraryDto } from './dto/regenerate-itinerary.dto';
import {
  BookingNeededRow,
  ItineraryDayRow,
  ItineraryHeaderRow,
  ItineraryListRow,
  ItinerariesRepository,
  SmartTipRow,
  TimelineItemRow,
  WarningRow,
} from './repositories/itineraries.repository';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generatePublicId(code: string | null, startDate: string | null): string {
  const dateStr = startDate ?? new Date().toISOString().slice(0, 10);
  const datePart = dateStr.replace(/-/g, '_');
  const codeStr = (code ?? 'unk').toLowerCase();
  const suffix = randomBytes(4).toString('hex');
  return `iti_${datePart}_${codeStr}_${suffix}`;
}

function pickName(
  row: { dest_name_ko: string; dest_name_en: string; dest_name_vi: string },
  lang: string,
): string {
  if (lang === 'vi') return row.dest_name_vi;
  if (lang === 'en') return row.dest_name_en;
  return row.dest_name_ko;
}

function safeMoney(
  amount: number | null,
  currency: string | null,
  display: string | null,
): { currency: string; amount: number; display: string } | null {
  if (amount === null || currency === null) return null;
  return { currency, amount, display: display ?? '' };
}

function requiredMoney(
  amount: number,
  currency: string,
  display: string | null,
): { currency: string; amount: number; display: string } {
  return { currency, amount, display: display ?? '' };
}

// ---------------------------------------------------------------------------
// Response shape types (match itinerary-schema.json exactly)
// ---------------------------------------------------------------------------

export interface ItineraryResponse {
  id: string;
  title: string;
  destination: {
    id: number;
    slug: string;
    code: string | null;
    name: string;
    heroImage: string | null;
  };
  summary: {
    nights: number;
    days: number;
    totalActivities: number;
    estimatedCost: { currency: string; amount: number; display: string };
    budgetLabel: string | null;
    generatedBy: string;
  };
  dayTabs: Array<{
    dayNumber: number;
    label: string;
    dateLabel: string;
    activityCount: number;
    isActive: boolean;
  }>;
  days: Array<{
    dayNumber: number;
    date: string;
    dateLabel: string;
    label: string;
    title: string;
    weather: {
      conditionCode: string;
      conditionLabel: string;
      temperatureC: number;
      note: string;
      iconKey: string | null;
    };
    estimatedCost: { currency: string; amount: number; display: string };
    items: Array<{
      id: string;
      type: string;
      startTime: string;
      durationMinutes: number;
      durationLabel: string;
      title: string;
      description: string;
      location: { name: string; address: string | null; lat: number | null; lng: number | null };
      estimatedCost: { currency: string; amount: number; display: string } | null;
      tipText: string | null;
      bookingRequired: boolean;
      bookingUrl: string | null;
      accentColor: string;
      iconKey: string;
      imageUrl: string | null;
      tags: string[];
    }>;
    warnings: Array<{ type: string; title: string | null; text: string; count: number | null }>;
    bookingNeeded: { count: number; items: string[] };
    smartTips: Array<{ orderNo: number; text: string; iconKey: string | null }>;
  }>;
  meta: {
    language: string;
    currency: string;
    travelerType: string;
    pace: string;
    budgetLevel: string;
    travelStyles: string[];
    interests: string[];
    saved: boolean;
    createdAt: string | null;
    updatedAt: string | null;
  };
}

export interface ItineraryListItem {
  id: string;
  title: string;
  destinationName: string;
  coverImage: string | null;
  startDate: string | null;
  nights: number;
  days: number;
  totalActivities: number;
  estimatedCostAmount: number;
  currency: string;
  badges: string[];
}

export interface SaveItineraryResult {
  id: string;
  status: 'saved';
  savedAt: string;
}

// ---------------------------------------------------------------------------
// Assembly helpers
// ---------------------------------------------------------------------------

function assembleItineraryResponse(
  header: ItineraryHeaderRow,
  days: ItineraryDayRow[],
  items: TimelineItemRow[],
  warnings: WarningRow[],
  bookingNeeded: BookingNeededRow[],
  smartTips: SmartTipRow[],
): ItineraryResponse {
  // Build lookup maps keyed by day id
  const itemsByDay = groupBy(items, (r) => r.itinerary_day_id);
  const warningsByDay = groupBy(warnings, (r) => r.itinerary_day_id);
  const bookingByDay = groupBy(bookingNeeded, (r) => r.itinerary_day_id);
  const tipsByDay = groupBy(smartTips, (r) => r.itinerary_day_id);

  const resolvedDays = days.map((day, idx) => {
    const dayItems = (itemsByDay.get(day.id) ?? []).map((item) => ({
      id: item.item_public_id,
      type: item.item_type,
      startTime: item.start_time,
      durationMinutes: item.duration_minutes,
      durationLabel: item.duration_label ?? '',
      title: item.title,
      description: item.description ?? '',
      location: {
        name: item.location_name ?? '',
        address: item.location_address,
        lat: item.location_lat,
        lng: item.location_lng,
      },
      estimatedCost: safeMoney(
        item.estimated_cost_amount,
        item.estimated_cost_currency,
        item.estimated_cost_display,
      ),
      tipText: item.tip_text,
      bookingRequired: item.booking_required,
      bookingUrl: item.booking_url,
      accentColor: item.accent_color ?? 'gray',
      iconKey: item.icon_key ?? 'pin',
      imageUrl: item.image_url,
      // tags is a json_agg result — convert to string[]
      tags: Array.isArray(item.tags)
        ? (item.tags as Array<{ label: string }>).map((t) => t.label)
        : [],
    }));

    const dayWarnings = (warningsByDay.get(day.id) ?? []).map((w) => ({
      type: w.warning_type,
      title: w.title,
      text: w.text,
      count: w.count_value,
    }));

    const dayBookingLabels = (bookingByDay.get(day.id) ?? []).map((b) => b.label);

    const daySmartTips = (tipsByDay.get(day.id) ?? []).map((t) => ({
      orderNo: t.order_no,
      text: t.text,
      iconKey: t.icon_key,
    }));

    return {
      dayNumber: day.day_number,
      date: day.date_value ?? '',
      dateLabel: day.date_label ?? '',
      label: day.day_label ?? `DAY ${day.day_number}`,
      title: day.title,
      weather: {
        conditionCode: day.weather_condition_code ?? 'sunny',
        conditionLabel: day.weather_condition_label ?? '',
        temperatureC: day.weather_temperature_c ?? 25,
        note: day.weather_note ?? '',
        iconKey: day.weather_icon_key,
      },
      estimatedCost: requiredMoney(
        day.estimated_cost_amount,
        day.estimated_cost_currency,
        day.estimated_cost_display,
      ),
      items: dayItems,
      warnings: dayWarnings,
      bookingNeeded: {
        count: dayBookingLabels.length,
        items: dayBookingLabels,
      },
      smartTips: daySmartTips,
    };
  });

  return {
    id: header.public_id,
    title: header.title,
    destination: {
      id: header.destination_id,
      slug: header.dest_slug,
      code: header.dest_code,
      name: pickName(header, header.language),
      heroImage: header.dest_hero_image_url,
    },
    summary: {
      nights: header.nights,
      days: header.days,
      totalActivities: header.total_activities,
      estimatedCost: requiredMoney(
        header.estimated_cost_amount,
        header.estimated_cost_currency,
        header.estimated_cost_display,
      ),
      budgetLabel: header.budget_label,
      generatedBy: header.generated_by,
    },
    dayTabs: days.map((day, idx) => ({
      dayNumber: day.day_number,
      label: day.day_label ?? `DAY ${day.day_number}`,
      dateLabel: day.date_label ?? '',
      activityCount: day.activity_count,
      isActive: idx === 0,
    })),
    days: resolvedDays,
    meta: {
      language: header.language,
      currency: header.currency,
      travelerType: header.traveler_type,
      pace: header.pace,
      budgetLevel: header.budget_level,
      travelStyles: Array.isArray(header.travel_styles) ? header.travel_styles : [],
      interests: Array.isArray(header.interests) ? header.interests : [],
      saved: header.is_saved,
      createdAt: header.created_at ?? null,
      updatedAt: header.updated_at ?? null,
    },
  };
}

function groupBy<T>(arr: T[], key: (item: T) => number): Map<number, T[]> {
  const map = new Map<number, T[]>();
  for (const item of arr) {
    const k = key(item);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(item);
  }
  return map;
}

function mapListRow(row: ItineraryListRow): ItineraryListItem {
  const badges: string[] = [];
  if (row.generated_by === 'ai') {
    if (row.language === 'vi') badges.push('AI tạo lịch trình');
    else if (row.language === 'en') badges.push('AI Itinerary');
    else badges.push('AI 생성 일정');
  }

  return {
    id: row.public_id,
    title: row.title,
    destinationName: pickName(row, row.language),
    coverImage: row.cover_image_url ?? row.dest_hero_image_url,
    startDate: row.start_date,
    nights: row.nights,
    days: row.days,
    totalActivities: row.total_activities,
    estimatedCostAmount: row.estimated_cost_amount,
    currency: row.estimated_cost_currency,
    badges,
  };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class ItinerariesService {
  constructor(
    private readonly repo: ItinerariesRepository,
    private readonly destinationsRepo: DestinationsRepository,
    @Inject(AI_PLANNER_SERVICE)
    private readonly planner: IAiPlannerService,
  ) {}

  // -------------------------------------------------------------------------
  // Generate
  // -------------------------------------------------------------------------

  async generate(dto: GenerateItineraryDto, userId: number): Promise<ItineraryResponse> {
    const dest = await this.destinationsRepo.findForPlanner(dto.destinationId);
    if (!dest) {
      throw new NotFoundException('Destination not found or is not active');
    }

    const plannerInput: PlannerInput = {
      destination: {
        id: dest.id,
        slug: dest.slug,
        code: dest.code,
        name: (() => {
          if (dto.language === 'vi') return dest.name_vi;
          if (dto.language === 'en') return dest.name_en;
          return dest.name_ko;
        })(),
        heroImageUrl: dest.hero_image_url,
      },
      startDate: dto.startDate ?? null,
      nights: dto.nights,
      days: dto.days,
      travelerType: dto.travelerType as PlannerInput['travelerType'],
      budgetLevel: dto.budgetLevel as PlannerInput['budgetLevel'],
      pace: dto.pace as PlannerInput['pace'],
      travelStyles: dto.travelStyles,
      interests: dto.interests,
      language: dto.language as PlannerInput['language'],
      currency: dto.currency as PlannerInput['currency'],
    };

    let plannerOutput;
    let aiError: string | null = null;

    try {
      plannerOutput = await this.planner.generate(plannerInput);
    } catch (err) {
      aiError = err instanceof Error ? err.message : 'unknown error';
      // Log and rethrow — but log first
      await this.logAi('generate', userId, plannerInput, null, 'error', aiError).catch(() => {});
      throw err;
    }

    const totalActivities = plannerOutput.days.reduce((sum, d) => sum + d.items.length, 0);
    const publicId = generatePublicId(dest.code, dto.startDate ?? null);

    await this.repo.insert({
      publicId,
      userId,
      destinationId: dest.id,
      title: plannerOutput.title,
      startDate: dto.startDate ?? null,
      nights: dto.nights,
      days: dto.days,
      travelerType: dto.travelerType,
      budgetLevel: dto.budgetLevel,
      pace: dto.pace,
      travelStyles: dto.travelStyles,
      interests: dto.interests,
      language: dto.language,
      currency: dto.currency,
      totalActivities,
      estimatedCostAmount: plannerOutput.totalCost.amount,
      estimatedCostCurrency: plannerOutput.totalCost.currency,
      estimatedCostDisplay: plannerOutput.totalCost.display,
      budgetLabel: plannerOutput.budgetLabel,
      generatedBy: 'ai',
      coverImageUrl: dest.hero_image_url,
      plannerDays: plannerOutput.days,
    });

    // Fire-and-forget AI log
    this.logAi(
      'generate',
      userId,
      plannerInput,
      { title: plannerOutput.title, days: plannerOutput.days.length },
      'success',
      null,
    ).catch(() => {});

    return this.buildFullResponse(publicId);
  }

  // -------------------------------------------------------------------------
  // List
  // -------------------------------------------------------------------------

  async list(userId: number, query: ItineraryQueryDto): Promise<{ items: ItineraryListItem[] }> {
    const rows = await this.repo.findAllByUserId(userId, query.savedOnly ?? false);
    return { items: rows.map(mapListRow) };
  }

  // -------------------------------------------------------------------------
  // Get by id
  // -------------------------------------------------------------------------

  async getById(publicId: string, userId: number): Promise<ItineraryResponse> {
    const header = await this.repo.findByPublicId(publicId);
    if (!header) {
      throw new NotFoundException('Itinerary not found');
    }
    if (header.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.buildFullResponseFromHeader(header);
  }

  // -------------------------------------------------------------------------
  // Save
  // -------------------------------------------------------------------------

  async save(publicId: string, userId: number): Promise<SaveItineraryResult> {
    // Verify ownership first
    const header = await this.repo.findByPublicId(publicId);
    if (!header) {
      throw new NotFoundException('Itinerary not found');
    }
    if (header.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const savedAt = await this.repo.markSaved(publicId, userId);
    if (!savedAt) {
      throw new NotFoundException('Itinerary not found');
    }

    return { id: publicId, status: 'saved', savedAt };
  }

  // -------------------------------------------------------------------------
  // Regenerate
  // -------------------------------------------------------------------------

  async regenerate(
    publicId: string,
    dto: RegenerateItineraryDto,
    userId: number,
  ): Promise<ItineraryResponse> {
    const header = await this.repo.findByPublicId(publicId);
    if (!header) {
      throw new NotFoundException('Itinerary not found');
    }
    if (header.user_id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Merge regenerate params with stored params (language/currency can be overridden)
    const language = dto.language ?? header.language;
    const currency = dto.currency ?? header.currency;

    const dest = await this.destinationsRepo.findForPlanner(header.destination_id);
    if (!dest) {
      throw new NotFoundException('Destination not found or is no longer active');
    }

    const plannerInput: PlannerInput = {
      destination: {
        id: dest.id,
        slug: dest.slug,
        code: dest.code,
        name: (() => {
          if (language === 'vi') return dest.name_vi;
          if (language === 'en') return dest.name_en;
          return dest.name_ko;
        })(),
        heroImageUrl: dest.hero_image_url,
      },
      startDate: typeof header.start_date === 'string' ? header.start_date : null,
      nights: header.nights,
      days: header.days,
      travelerType: header.traveler_type as PlannerInput['travelerType'],
      budgetLevel: header.budget_level as PlannerInput['budgetLevel'],
      pace: header.pace as PlannerInput['pace'],
      travelStyles: Array.isArray(header.travel_styles) ? header.travel_styles : [],
      interests: Array.isArray(header.interests) ? header.interests : [],
      language: language as PlannerInput['language'],
      currency: currency as PlannerInput['currency'],
    };

    let plannerOutput;
    try {
      plannerOutput = await this.planner.generate(plannerInput);
    } catch (err) {
      await this.logAi('regenerate', userId, plannerInput, null, 'error',
        err instanceof Error ? err.message : 'unknown error').catch(() => {});
      throw err;
    }

    const totalActivities = plannerOutput.days.reduce((sum, d) => sum + d.items.length, 0);

    await this.repo.regenerateDays(header.id, plannerOutput.days, {
      title: plannerOutput.title,
      totalActivities,
      estimatedCostAmount: plannerOutput.totalCost.amount,
      estimatedCostCurrency: plannerOutput.totalCost.currency,
      estimatedCostDisplay: plannerOutput.totalCost.display,
      budgetLabel: plannerOutput.budgetLabel,
    });

    // Fire-and-forget AI log
    this.logAi(
      'regenerate',
      userId,
      plannerInput,
      { title: plannerOutput.title, days: plannerOutput.days.length },
      'success',
      null,
    ).catch(() => {});

    return this.buildFullResponse(publicId);
  }

  // -------------------------------------------------------------------------
  // Private: fetch full tree and assemble response
  // -------------------------------------------------------------------------

  private async buildFullResponse(publicId: string): Promise<ItineraryResponse> {
    const header = await this.repo.findByPublicId(publicId);
    if (!header) {
      throw new NotFoundException('Itinerary not found after insert');
    }
    return this.buildFullResponseFromHeader(header);
  }

  private async buildFullResponseFromHeader(header: ItineraryHeaderRow): Promise<ItineraryResponse> {
    const days = await this.repo.findDaysByItineraryId(header.id);
    const dayIds = days.map((d) => d.id);

    const [items, warnings, bookingNeeded, smartTips] = await Promise.all([
      this.repo.findItemsByDayIds(dayIds),
      this.repo.findWarningsByDayIds(dayIds),
      this.repo.findBookingNeededByDayIds(dayIds),
      this.repo.findSmartTipsByDayIds(dayIds),
    ]);

    return assembleItineraryResponse(header, days, items, warnings, bookingNeeded, smartTips);
  }

  // -------------------------------------------------------------------------
  // Private: AI generation log (fire-and-forget)
  // -------------------------------------------------------------------------

  private async logAi(
    featureType: string,
    userId: number,
    requestPayload: object,
    responsePayload: object | null,
    status: 'success' | 'error',
    errorMessage: string | null,
  ): Promise<void> {
    const meta = this.planner.lastCallMeta;
    await this.repo.insertAiLog({
      userId,
      featureType,
      requestPayload,
      responsePayload,
      status,
      providerName: meta?.providerName ?? 'mock',
      modelName: meta?.modelName ?? null,
      tokensUsed: meta?.tokensUsed ?? null,
      errorMessage,
    });
  }
}

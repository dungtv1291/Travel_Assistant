import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { UserPreferencesRepository } from './repositories/user-preferences.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly preferencesRepo: UserPreferencesRepository,
  ) {}

  // -------------------------------------------------------------------------
  // GET /users/profile  (api-contract.md §3.1)
  // -------------------------------------------------------------------------

  async getProfile(userId: number) {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const [counts, prefs] = await Promise.all([
      this.usersRepo.getProfileCounts(userId),
      this.preferencesRepo.findByUserId(userId),
    ]);

    return {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      avatarUrl: user.avatar_url,
      savedTripsCount: counts.saved_trips_count,
      bookingsCount: counts.bookings_count,
      favoritesCount: counts.favorites_count,
      travelStyles: prefs?.travel_styles ?? [],
      interestKeywords: prefs?.interest_keywords ?? [],
    };
  }

  // -------------------------------------------------------------------------
  // PATCH /users/profile  (api-contract.md §3.2)
  // -------------------------------------------------------------------------

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const updated = await this.usersRepo.updateProfile(userId, {
      fullName: dto.fullName,
      avatarUrl: dto.avatarUrl,
    });
    if (!updated) throw new NotFoundException('User not found');

    return {
      id: updated.id,
      fullName: updated.full_name,
      avatarUrl: updated.avatar_url,
    };
  }

  // -------------------------------------------------------------------------
  // GET /users/preferences  (api-contract.md §3.3)
  // -------------------------------------------------------------------------

  async getPreferences(userId: number) {
    const user = await this.usersRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const prefs = await this.preferencesRepo.findByUserId(userId);

    return {
      language: user.language,
      preferredCurrency: user.preferred_currency,
      darkModeEnabled: user.dark_mode_enabled,
      pushNotificationEnabled: user.push_notification_enabled,
      travelerType: prefs?.traveler_type ?? null,
      budgetLevel: prefs?.budget_level ?? null,
      pace: prefs?.pace ?? null,
    };
  }

  // -------------------------------------------------------------------------
  // PATCH /users/preferences  (api-contract.md §3.4)
  // -------------------------------------------------------------------------

  async updatePreferences(userId: number, dto: UpdatePreferencesDto) {
    // Split fields: users table vs user_preferences table
    const userFields: Parameters<typeof this.usersRepo.updateSettings>[1] = {};
    const prefFields: Parameters<typeof this.preferencesRepo.upsert>[1] = {};

    if (dto.language !== undefined) userFields.language = dto.language;
    if (dto.preferredCurrency !== undefined) userFields.preferredCurrency = dto.preferredCurrency;
    if (dto.darkModeEnabled !== undefined) userFields.darkModeEnabled = dto.darkModeEnabled;
    if (dto.pushNotificationEnabled !== undefined)
      userFields.pushNotificationEnabled = dto.pushNotificationEnabled;

    if (dto.travelerType !== undefined) prefFields.travelerType = dto.travelerType;
    if (dto.budgetLevel !== undefined) prefFields.budgetLevel = dto.budgetLevel;
    if (dto.pace !== undefined) prefFields.pace = dto.pace;

    await Promise.all([
      Object.keys(userFields).length > 0
        ? this.usersRepo.updateSettings(userId, userFields)
        : Promise.resolve(),
      Object.keys(prefFields).length > 0
        ? this.preferencesRepo.upsert(userId, prefFields)
        : Promise.resolve(),
    ]);

    // Return full current preference state
    return this.getPreferences(userId);
  }
}

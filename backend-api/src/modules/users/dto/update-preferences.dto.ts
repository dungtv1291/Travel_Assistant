import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class UpdatePreferencesDto {
  // ---- Users table fields -------------------------------------------------

  @IsOptional()
  @IsIn(['ko', 'en', 'vi'])
  language?: string;

  @IsOptional()
  @IsIn(['KRW', 'VND', 'USD'])
  preferredCurrency?: string;

  @IsOptional()
  @IsBoolean()
  darkModeEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotificationEnabled?: boolean;

  // ---- user_preferences table fields --------------------------------------

  @IsOptional()
  @IsIn(['solo', 'couple', 'family', 'friends'])
  travelerType?: string;

  @IsOptional()
  @IsIn(['budget', 'medium', 'luxury'])
  budgetLevel?: string;

  @IsOptional()
  @IsIn(['relaxed', 'balanced', 'active'])
  pace?: string;
}

import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  workStartHour: string;

  @IsString()
  workEndHour: string;

  @IsOptional()
  totalBreakHours?: number;
}

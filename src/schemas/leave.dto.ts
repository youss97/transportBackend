import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { LeaveType, LeaveStatus } from '../schemas/leave.schema';

export class CreateLeaveDto {
  @ApiProperty({
    enum: LeaveType,
    description: 'Type de congé (NORMAL ou SICK)',
  })
  @IsEnum(LeaveType)
  type: LeaveType;

  @ApiProperty({ type: String, example: '2025-08-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ type: String, example: '2025-08-05' })
  @IsDateString()
  endDate: string;
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Fichier médical (si type SICK)',
  })
  @IsOptional()
  medicalFile?: any; // Pour Swagger et file upload avec @UseInterceptors(FileInterceptor())
}

export class UpdateLeaveStatusDto {
  @ApiProperty({
    enum: LeaveStatus,
    description: 'Statut du congé (APPROVED ou REJECTED)',
  })
  @IsEnum(LeaveStatus)
  status: LeaveStatus;
}

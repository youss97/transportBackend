import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({
    description: 'Liste des IDs des chauffeurs',
    type: [String],
    required: false,
  })
  @IsOptional()
  drivers?: string[];

  @ApiProperty({
    description: 'Liste des IDs des superviseurs',
    type: [String],
    required: false,
  })
  @IsOptional()
  supervisors?: string[];

  @ApiProperty({
    description: 'ID du site',
    type: String,
    required: false,
  })
  @IsOptional()
  site: string;
}

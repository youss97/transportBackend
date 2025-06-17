import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  vehicleId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  activityId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  expirationDate?: string;
}

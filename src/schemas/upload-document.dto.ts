import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  vehicleId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  activityId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  expirationDate?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  owner: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  companyId: string;
}

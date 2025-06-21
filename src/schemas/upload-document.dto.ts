import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty()
  @IsString()
  type: string;

  // Ces champs sont optionnels dans Swagger et la validation
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  activityId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  expirationDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  owner?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  companyId?: string;
}

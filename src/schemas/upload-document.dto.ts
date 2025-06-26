import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DocumentStatus } from 'src/enums/document-status.enum';

export class UploadDocumentDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ApiProperty()
  @IsString()
  type: string;
  @ApiProperty({
    required: false,
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
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

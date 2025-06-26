// src/dtos/update-document-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { DocumentStatus } from 'src/enums/document-status.enum'; // Adjust the path as needed

export class UpdateDocumentStatusDto {
  @ApiProperty({ enum: DocumentStatus, description: 'The new status of the document' })
  @IsNotEmpty()
  @IsEnum(DocumentStatus)
  status: DocumentStatus;
}
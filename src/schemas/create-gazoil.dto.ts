import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateGazoilDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  montantPhoto: any;

  @ApiProperty({ type: 'string', format: 'binary' })
  kilometragePhoto: any;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  comment?: string;
}

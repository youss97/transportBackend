import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsString, IsOptional, IsEmail, ValidateIf } from "class-validator";

export class UpdateCompanyDto {
  // Champs de la société uniquement
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @IsString()
  slug?: string;

  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  @IsOptional()
  logo?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined)
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => value?.trim() || undefined) // Convertit les chaînes vides en undefined
  @ValidateIf((o) => o.email !== undefined && o.email !== null && o.email !== '') // Ne valide que si l'email a une valeur
  @IsEmail({}, { message: 'L\'email doit être un email valide' })
  email?: string;
}
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsEmail, IsEnum, IsDateString } from "class-validator";
import { UserRole } from "src/enums/user-role.enum";

export class CreateCompanySwaggerDto {
  // Champs de la société
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  logo?: any;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  // Champs de l'admin user (aplatis)
  @ApiProperty({ description: 'Email de l\'admin' })
  @IsEmail()
  adminEmail: string;

  @ApiProperty({ description: 'Mot de passe de l\'admin' })
  @IsString()
  adminPassword: string;

  @ApiProperty({ description: 'Prénom de l\'admin' })
  @IsString()
  adminFirstName: string;

  @ApiProperty({ description: 'Nom de l\'admin' })
  @IsString()
  adminLastName: string;

  @ApiProperty({ enum: UserRole, description: 'Rôle de l\'admin' })
  @IsEnum(UserRole)
  adminRole: UserRole;

  @ApiProperty({ required: false, description: 'Téléphone de l\'admin' })
  @IsOptional()
  @IsString()
  adminPhone?: string;

  @ApiProperty({ required: false, description: 'Adresse de l\'admin' })
  @IsOptional()
  @IsString()
  adminAddress?: string;

  @ApiProperty({ required: false, description: 'Date de naissance de l\'admin' })
  @IsOptional()
  @IsDateString()
  adminBirthDate?: string;

  // IMPORTANT : Photo de l'admin au niveau racine
  @ApiProperty({ 
    required: false, 
    type: 'string', 
    format: 'binary',
    description: 'Photo de l\'admin'
  })
  photo?: any;
}
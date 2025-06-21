import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsEmail, IsOptional, IsNumber, IsArray, IsObject, ValidateNested } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class CreateCompanyDto {
    @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

    @ApiProperty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  subscriptionPlan?: string;

  @IsOptional()
  subscriptionEndDate?: Date;

  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @IsOptional()
  @IsNumber()
  maxVehicles?: number
   @ApiProperty({ type: CreateUserDto })
  @ValidateNested()
  @Type(() => CreateUserDto)
  adminUser: CreateUserDto;
}
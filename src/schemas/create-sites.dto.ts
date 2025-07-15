import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsEmail } from 'class-validator';

export class CreateSiteDto {
  @ApiProperty({ example: 'Site de Sfax' })
  @IsString()
  @IsNotEmpty()
  nom_site: string;

  @ApiProperty({ example: 'Route A1 Km 5, Sfax' })
  @IsString()
  @IsNotEmpty()
  adresse_depart: string;

  @ApiProperty({ example: 'Route Gremda, Sfax' })
  @IsString()
  @IsNotEmpty()
  adresse_arrivee: string;

  @ApiProperty({ example: '1h 30min' })
  @IsString()
  @IsNotEmpty()
  temp_trajet: string;

  @ApiProperty({ example: 'Ali Ben Salah' })
  @IsString()
  @IsNotEmpty()
  nom_resp_mine: string;


  @ApiProperty({ example: '+21612345678' })
  @IsString()
  @IsNotEmpty()
  telephone_resp_mine: string;

  @ApiProperty({ example: 'resp@mine.tn' })
  @IsEmail()
  mail_resp_mine: string;

  @ApiProperty({ example: 24.5 })
  @IsNumber()
  prix_tonne: number;
}

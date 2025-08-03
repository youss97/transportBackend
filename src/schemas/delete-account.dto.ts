import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class DeleteAccountDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email de l’utilisateur à supprimer' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mot de passe de l’utilisateur' })
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Supprimer uniquement les données sans supprimer le compte (optionnel)',
  })
  @IsOptional()
  deleteOnlyData?: boolean;
}

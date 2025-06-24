import { PartialType } from '@nestjs/swagger';
import { CreateChargementDechargementDto } from './create-chargement-dechargement.dto';

export class UpdateChargementDechargementDto extends PartialType(CreateChargementDechargementDto) {}

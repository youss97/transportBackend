import { PartialType } from '@nestjs/swagger';
import { CreateSiteDto } from './create-sites.dto';
export class UpdateSiteDto extends PartialType(CreateSiteDto) {}

import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateContactDto } from 'src/schemas/create-contact.dto';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Soumettre une question via le formulaire de contact' })
  create(@Body() dto: CreateContactDto) {
    return this.contactService.create(dto);
  }
}

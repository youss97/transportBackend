import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact } from 'src/schemas/contact.schema';
import { CreateContactDto } from 'src/schemas/create-contact.dto';

@Injectable()
export class ContactService {
  constructor(@InjectModel(Contact.name) private contactModel: Model<Contact>) {}

  async create(dto: CreateContactDto): Promise<Contact> {
    const contact = new this.contactModel(dto);
    return contact.save();
  }
}

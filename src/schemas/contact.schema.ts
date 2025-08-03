import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Contact extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  details: string;

  @Prop({ required: true })
  email: string;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);

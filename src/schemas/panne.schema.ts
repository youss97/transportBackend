import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Panne extends Document {
  @Prop({ required: true })
  datePanne: Date;

  @Prop({ required: true })
  position: string;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop([String]) // Tableau d’URL des images
  photoUrls: string[];
}

export const PanneSchema = SchemaFactory.createForClass(Panne);

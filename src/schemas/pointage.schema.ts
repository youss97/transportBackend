import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PointageDocument = Pointage & Document;

@Schema({ timestamps: true })
export class Pointage {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  driver: Types.ObjectId;
@Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company: Types.ObjectId;
  @Prop({ type: Date })
  pointageDebut: Date;

  @Prop({ type: Date })
  pointageFin: Date;

  @Prop({ type: Date })
  pauseDebut: Date;

  @Prop({ type: Date })
  pauseFin: Date;

  @Prop({ type: String })
  photoSelfie: string;

  @Prop({ type: String })
  photoKilometrage: string;


}

export const PointageSchema = SchemaFactory.createForClass(Pointage);
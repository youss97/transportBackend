import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChargmentDechargementDocument = ChargmentDechargement & Document;

@Schema({ timestamps: true })
export class ChargmentDechargement {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  driver: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company: Types.ObjectId;
  @Prop({ type: Date })
  chargement: Date;
  @Prop({ type: Date })
  portDirection: Date;
  @Prop({ type: Date })
  baseDirection: Date;
  @Prop({ type: Date })
  arriveeBase: Date;
  @Prop({ type: Date })
  dechargement: Date;

  @Prop({ type: String })
  photo: string;
}

export const ChargmentDechargementSchemas = SchemaFactory.createForClass(
  ChargmentDechargement,
);

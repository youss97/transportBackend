import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ActivityType } from 'src/enums/activity-type.enum';

@Schema({ timestamps: true })
export class Activity extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  driver: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicle: Types.ObjectId;

  @Prop({ required: true, enum: ActivityType })
  type: ActivityType;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop()
  kilometers: number;

  @Prop()
  weight: number;

  @Prop()
  fuelQuantity: number;

  @Prop()
  fuelPrice: number;

  @Prop()
  fuelStation: string;

  @Prop()
  location: string;

  @Prop()
  notes: string;

  @Prop({ default: false })
  validated: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  validatedBy: Types.ObjectId;

  @Prop()
  validatedAt: Date;

  @Prop({ type: [String] })
  photos: string[];
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
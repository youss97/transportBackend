import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ActivityType } from 'src/enums/activity-type.enum';
export class Location {
  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop()
  address?: string;
}

@Schema({ timestamps: true })
export class Activity extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  driver: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Vehicle' })
  vehicle: Types.ObjectId;

  @Prop({ required: true, enum: ActivityType })
  type: ActivityType;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ type: Location })
  location: Location;

  @Prop()
  photos: string[];

  @Prop()
  notes: string;

  // Spécifique au pointage
  @Prop()
  workHours: number;

  // Spécifique à l'état des lieux
  @Prop()
  damages: string[];

  @Prop()
  kilometers: number;

  // Spécifique au chargement/déchargement
  @Prop()
  weight: number;

  @Prop()
  weighingTicket: string;

  // Spécifique au carburant
  @Prop()
  fuelQuantity: number;

  @Prop()
  fuelPrice: number;

  @Prop()
  fuelStation: string;

  @Prop({ default: false })
  validated: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  validatedBy: Types.ObjectId;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
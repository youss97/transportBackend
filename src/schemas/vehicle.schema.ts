import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Vehicle extends Document {
  // AJOUT CRUCIAL : ID de la société
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  currentDriver?: Types.ObjectId;

  @Prop({ required: true })
  licensePlate: string;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  modelCar: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  fuelType: string;

  @Prop({ default: 'disponible' })
  status: string;

  @Prop({ default: 0 })
  maintenanceKilometers: number;

  @Prop({ default: 15000 })
  nextMaintenanceKm: number;

  @Prop()
  insuranceExpirationDate: Date;

  @Prop()
  technicalControlDate: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Vehicle extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  currentDriver?: Types.ObjectId; // Optionnel

  @Prop()
  licensePlate: string;

  @Prop()
  brand: string;

  @Prop()
  modelCar: string;

  @Prop({ required: false })
  year: number;

  @Prop({ required: false })
  fuelType: string;

  @Prop({ default: 'disponible' })
  status: string;

  @Prop({ default: 0 })
  maintenanceKilometers: number;

  @Prop({ default: 15000 })
  nextMaintenanceKm: number;

  @Prop()
  insuranceExpirationDate: string;

  @Prop()
  technicalControlDate: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  carteGriseNumber?: string;

  @Prop()
  carteGriseRegistrationDate?: string;

  @Prop()
  carteGriseBrand?: string;

  @Prop()
  carteGriseModel?: string;

  @Prop()
  carteGriseFuelType?: string;

  @Prop()
  kilometersAtPurchase?: number;

  @Prop()
  vehicleCategory?: string;

  @Prop()
  insuranceName?: string;

  @Prop()
  insuranceType?: string;

  @Prop()
  insuranceStartDate?: string;

  @Prop()
  insuranceEndDate?: string;

  @Prop()
  lastOilChangeDate?: string;

  @Prop()
  technicalControlExpirationDate?: string;

  @Prop()
  carteGriseFile?: string;

  @Prop()
  insuranceFileUrl?: string;

  @Prop()
  technicalControlFileUrl?: string;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

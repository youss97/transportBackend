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
  insuranceExpirationDate: Date;

  @Prop()
  technicalControlDate: Date;

  @Prop({ default: true })
  isActive: boolean;
  @Prop({ required: false })
  carteGriseNumber?: string;

  @Prop({ type: Date })
  carteGriseRegistrationDate?: Date;

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

  @Prop({ type: Date })
  insuranceStartDate?: Date;

  @Prop({ type: Date })
  insuranceEndDate?: Date;

  @Prop()
  lastOilChangeDate?: Date;

  @Prop({ type: Date })
  technicalControlExpirationDate?: Date;

  // Champs fichiers
  @Prop()
  carteGriseFile?: string;

  @Prop()
  insuranceFileUrl?: string;

  @Prop()
  technicalControlFileUrl?: string;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

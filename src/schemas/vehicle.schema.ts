import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { VehicleStatus } from 'src/enums/vehicle-status.enum';

@Schema({ timestamps: true })
export class Vehicle extends Document {
  @Prop({ required: true, unique: true })
  licensePlate: string;

  @Prop()
  brand: string;

  @Prop()
  carModel: string;

  @Prop()
  year: number;

  @Prop({ required: true, enum: VehicleStatus, default: VehicleStatus.AVAILABLE })
  status: VehicleStatus;

  @Prop({ required: true, default: 0 })
  totalKilometers: number;

  @Prop({ required: true, default: 0 })
  maintenanceKilometers: number;

  @Prop()
  insuranceStartDate: Date;

  @Prop()
  insuranceEndDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  currentDriver: Types.ObjectId;

  @Prop({ default: Date.now })
  lastMaintenanceDate: Date;

  @Prop({ default: 30000 })
  nextMaintenanceKm: number;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
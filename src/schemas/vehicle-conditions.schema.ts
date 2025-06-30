import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class VehicleCondition extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Driver', required: true })
  driverId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicleId: Types.ObjectId;

  @Prop() leftSide: string;
  @Prop() rightSide: string;
  @Prop() frontLeftAngle: string;
  @Prop() frontRightAngle: string;
  @Prop() frontFace: string;
  @Prop() rearFace: string;
  @Prop() interior: string;
  @Prop() mileage: string; // image of mileage
}

export const VehicleConditionSchema = SchemaFactory.createForClass(VehicleCondition);

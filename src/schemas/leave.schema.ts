import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LeaveType {
  NORMAL = 'NORMAL',
  SICK = 'SICK',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class Leave extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  companyId: Types.ObjectId;

  @Prop({ enum: LeaveType, required: true })
  type: LeaveType;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ enum: LeaveStatus, default: LeaveStatus.PENDING })
  status: LeaveStatus;

  @Prop()
  medicalFileUrl?: string;
}

export const LeaveSchema = SchemaFactory.createForClass(Leave);

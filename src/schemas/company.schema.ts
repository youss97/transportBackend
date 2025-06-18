import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Company extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string; 
  @Prop()
  logo: string;

  @Prop()
  address: string;

  @Prop()
  phone: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  website: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  subscriptionPlan: string; 

  @Prop()
  subscriptionEndDate: Date;

  @Prop({ default: 100 })
  maxUsers: number;

  @Prop({ default: 50 })
  maxVehicles: number;
}

export const CompanySchema = SchemaFactory.createForClass(Company);


import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CompanySettings extends Document {
  @Prop({ required: true })
  companyId: string;

  @Prop({ required: true })
  workStartHour: string;

  @Prop({ required: true })
  workEndHour: string;

  @Prop()
  totalBreakHours?: number;


}

export const CompanySettingsSchema = SchemaFactory.createForClass(CompanySettings);
